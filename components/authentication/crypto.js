 
import { x25519 } from '@noble/curves/ed25519.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { argon2id } from '@noble/hashes/argon2.js';
 

// Convert hex string to Uint8Array
export const hexToUint8Array = (hex) => {
    if (!hex) return new Uint8Array();
    const a = [];
    for (let i = 0, len = hex.length; i < len; i += 2) {
        a.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(a);
};

// Convert Uint8Array to hex string
export const uint8ArrayToHex = (arr) => {
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate Curve25519 keypair
export const generateIdentityKeyPair = () => {
    try {
        // x25519 private key is 32 cryptographically secure random bytes
        const privateKey = window.crypto.getRandomValues(new Uint8Array(32));
        const publicKey = x25519.getPublicKey(privateKey);
        return {
            privateKey: uint8ArrayToHex(privateKey),
            publicKey: uint8ArrayToHex(publicKey)
        };
    } catch (error) {
        console.error("Failed to generate identity key pair:", error);
        throw new Error("Encryption key generation failed. Please try again.");
    }
};

// Stretch password using Argon2id (Fixed: Made fully asynchronous)
export const stretchPassword = async (password, saltHex) => {
    const salt = hexToUint8Array(saltHex);
    
    // CRITICAL: @noble/hashes argon2id returns a Promise. It MUST be awaited.
    const key = await argon2id(password, salt, {
        p: 1,
        t: 3,
        m: 65536, // 64 MB
        dkLen: 32
    });
    
    return key;
};

// Encrypt private key with derived AES key
export const encryptPrivateKey = async (privateKeyHex, aesKeyUint8Array) => {
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        aesKeyUint8Array,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedPrivKey = new TextEncoder().encode(privateKeyHex);
    
    const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encodedPrivKey
    );
    
    const encryptedArray = new Uint8Array(iv.length + cipherBuffer.byteLength);
    encryptedArray.set(iv, 0);
    encryptedArray.set(new Uint8Array(cipherBuffer), iv.length);
    
    return uint8ArrayToHex(encryptedArray);
};

// Decrypt private key with derived AES key
export const decryptPrivateKey = async (encryptedHex, aesKeyUint8Array) => {
    const encryptedArray = hexToUint8Array(encryptedHex);
    const iv = encryptedArray.slice(0, 12);
    const ciphertext = encryptedArray.slice(12);
    
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        aesKeyUint8Array,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        ciphertext
    );
    
    return new TextDecoder().decode(decryptedBuffer);
};

// Device Key Management
export const getDeviceKey = () => {
    if (typeof window === 'undefined') return ''; // Server Side Rendering (SSR) safety fallback
    let key = localStorage.getItem('device_key');
    if (!key) {
        key = uint8ArrayToHex(window.crypto.getRandomValues(new Uint8Array(32)));
        localStorage.setItem('device_key', key);
    }
    return key;
};

// Save Private Key protected by Device Key for Returning User Persistence
export const persistPrivateKeyLocally = async (privateKeyHex) => {
    const deviceKey = hexToUint8Array(getDeviceKey());
    const encrypted = await encryptPrivateKey(privateKeyHex, deviceKey);
    localStorage.setItem('local_encrypted_pk', encrypted);
};

// Restore Private Key from local storage
export const restorePrivateKeyLocally = async () => {
    if (typeof window === 'undefined') return null; // Server Side Rendering (SSR) safety fallback
    const encrypted = localStorage.getItem('local_encrypted_pk');
    if (!encrypted) return null;
    
    try {
        const deviceKey = hexToUint8Array(getDeviceKey());
        return await decryptPrivateKey(encrypted, deviceKey);
    } catch (e) {
        console.error("Failed to restore local private key", e);
        return null;
    }
};

export const generateSalt = () => {
    return uint8ArrayToHex(window.crypto.getRandomValues(new Uint8Array(16)));
};

// ============================================
// Message Encryption Functions (E2EE Chat)
// ============================================

// Generate a random AES key for encrypting individual messages
export const generateAESKey = () => {
    return window.crypto.getRandomValues(new Uint8Array(32));
};

// Encrypt message content with AES-GCM
export const aesEncrypt = async (plaintext, aesKeyUint8Array) => {
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        aesKeyUint8Array,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(plaintext);
    
    const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encodedText
    );
    
    const encryptedArray = new Uint8Array(iv.length + cipherBuffer.byteLength);
    encryptedArray.set(iv, 0);
    encryptedArray.set(new Uint8Array(cipherBuffer), iv.length);
    
    return uint8ArrayToHex(encryptedArray);
};

// Decrypt message content with AES-GCM
export const aesDecrypt = async (encryptedHex, aesKeyUint8Array) => {
    const encryptedArray = hexToUint8Array(encryptedHex);
    const iv = encryptedArray.slice(0, 12);
    const ciphertext = encryptedArray.slice(12);
    
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        aesKeyUint8Array,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        ciphertext
    );
    
    return new TextDecoder().decode(decryptedBuffer);
};

// Derive shared secret using X25519 ECDH
export const deriveSharedSecret = (myPrivateKeyHex, theirPublicKeyHex) => {
    try {
        const myPrivateKey = hexToUint8Array(myPrivateKeyHex);
        const theirPublicKey = hexToUint8Array(theirPublicKeyHex);
        
        // X25519 ECDH: shared secret = x25519.getSharedSecret(myPrivateKey, theirPublicKey)
        const sharedSecret = x25519.getSharedSecret(myPrivateKey, theirPublicKey);
        
        return new Uint8Array(sharedSecret);
    } catch (error) {
        console.error('Failed to derive shared secret:', error);
        throw new Error('Key derivation failed');
    }
};

// Derive 32-byte AES key from shared secret using HKDF
export const deriveAESKeyFromSharedSecret = (sharedSecret) => {
    try {
        const salt = new Uint8Array(0); 
        const info = new TextEncoder().encode('deepscreen-e2ee-aes-key');
        
        const aesKey = hkdf(sha256, sharedSecret, salt, info, 32);
        
        return new Uint8Array(aesKey);
    } catch (error) {
        console.error('Failed to derive AES key:', error);
        throw new Error('AES key derivation failed');
    }
};

// Derive AES key from recipient's public key
export const deriveAESKeyFromPublicKey = async (myPrivateKeyHex, theirPublicKeyHex) => {
    const sharedSecret = deriveSharedSecret(myPrivateKeyHex, theirPublicKeyHex);
    return deriveAESKeyFromSharedSecret(sharedSecret);
};

// Deprecated signature layer kept for application compliance
export const encryptWithPublicKey = async (aesKeyUint8Array, recipientPublicKeyHex) => {
    console.warn('encryptWithPublicKey called but AES key is now derived from ECDH');
    return uint8ArrayToHex(aesKeyUint8Array);
};

// Decrypt AES key with private key using X25519 ECDH
export const decryptWithPrivateKey = async (encryptedKeyDer, myPrivateKeyHex, senderPublicKeyHex) => {
    const sharedSecret = deriveSharedSecret(myPrivateKeyHex, senderPublicKeyHex);
    const aesKey = deriveAESKeyFromSharedSecret(sharedSecret);
    return aesKey;
};