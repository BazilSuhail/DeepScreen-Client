'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '@/utils/api';
import { rtcApi } from '@/utils/interview_api';
import { LIVEKIT_URL } from '@/utils/config';
import {
    HiOutlineVideoCamera,
    HiOutlineVideoCameraSlash,
    HiOutlineMicrophone,
    HiOutlineShieldCheck,
    HiOutlineArrowRight,
    HiOutlineArrowPath,
    HiOutlineLockClosed,
    HiOutlineCamera,
    HiOutlineExclamationTriangle,
    HiOutlineEnvelope,
    HiOutlineSignal,
    HiOutlineInformationCircle,
} from 'react-icons/hi2';
import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';
import ActiveInterviewRoom from './ActiveInterviewRoom';
import ErrorState from '@/components/dashboard/ErrorState';
import JoinInterviewSkeleton from '@/components/skeletons/interview/JoinInterviewSkeleton';
import { base, fadeUp } from '@/constants/motion';
import { badge, card, focusRing, iconTile, primaryButton, secondaryButton } from '@/components/ui/styles';

const PAGE = 'min-h-dvh w-full bg-background px-4 py-6 sm:px-6 lg:px-8 2xl:px-10';

function Spinner() {
    return <span aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />;
}

// Device permission state shown as a checklist chip.
const PERM_CHIP = {
    idle: { label: 'Not checked', className: 'bg-muted text-muted-foreground' },
    checking: { label: 'Checking', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
    granted: { label: 'Allowed', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    denied: { label: 'Blocked', className: 'bg-red-500/10 text-red-700 dark:text-red-400' },
};

function CheckRow({ icon: Icon, title, text, chip }) {
    return (
        <li className="flex items-center gap-3 rounded-md border border-border p-3">
            <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
            </div>
            {chip && <span className={`${badge} shrink-0 ${chip.className}`}>{chip.label}</span>}
        </li>
    );
}

function CenteredScreen({ children }) {
    return (
        <div className={`${PAGE} flex items-center justify-center`}>
            <motion.div {...fadeUp} transition={base} className="w-full max-w-md space-y-4">
                <div className="flex items-center gap-3">
                    <span className={`${iconTile} h-10 w-10 bg-red-500/10 text-red-600 dark:text-red-400`}>
                        <HiOutlineVideoCameraSlash className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live interview</p>
                        <h1 className="text-lg font-semibold">We could not open this interview</h1>
                    </div>
                </div>
                {children}
            </motion.div>
        </div>
    );
}

// Preview-only toggle: changes what this lobby shows, never the tracks used in the room.
function PreviewToggle({ on, onClick, onIcon: OnIcon, offIcon: OffIcon, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={on}
            className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-[color,background-color,border-color,translate,scale] active:scale-[0.97] motion-reduce:transform-none ${focusRing} ${
                on
                    ? 'border-emerald-200 bg-card text-emerald-800 hover:bg-emerald-50 dark:border-white/10 dark:text-foreground dark:hover:bg-white/5'
                    : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
            }`}
        >
            <span className="relative flex items-center justify-center">
                {on ? <OnIcon className="h-5 w-5" aria-hidden="true" /> : <OffIcon className="h-5 w-5" aria-hidden="true" />}
                {/* hi2 has no mic-off glyph; same slash ActiveInterviewRoom draws over its mic button. */}
                {!on && OnIcon === OffIcon && <span aria-hidden="true" className="absolute h-0.5 w-6 rotate-45 rounded-full bg-current" />}
            </span>
            {label}: {on ? 'on' : 'off'}
        </button>
    );
}

export default function JoinInterview({ token }) {
    const router = useRouter();
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lkToken, setLkToken] = useState(null);
    const [lkData, setLkData] = useState(null);
    const [role, setRole] = useState(null);
    const [interview, setInterview] = useState(null);
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState(null);
    const [stream, setStream] = useState(null);
    const streamRef = useRef(null);
    const [micEnabled, setMicEnabled] = useState(true);
    const [camEnabled, setCamEnabled] = useState(true);

    // Permission states: 'idle' | 'checking' | 'granted' | 'denied'
    const [permState, setPermState] = useState('idle');
    const [permError, setPermError] = useState(null);
    const [showPermModal, setShowPermModal] = useState(true);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/interviews/candidate/join/${token}/`);
                setInterview(response.interview);
            } catch (err) {
                setError(err.message || 'Invalid or expired interview link');
            } finally {
                setLoading(false);
            }
        };
        fetchInterview();
        return () => {
            const current = streamRef.current;
            if (current) current.getTracks().forEach(track => track.stop());
        };
    }, [token]);

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // LiveKit opens its own camera/mic once the room token arrives; release the lobby preview so the devices aren't captured twice.
    useEffect(() => {
        if (lkToken) streamRef.current?.getTracks().forEach((track) => track.stop());
    }, [lkToken]);

    // Mutes only the lobby preview stream; LiveKit opens its own tracks in the room.
    const toggleMicPreview = () => {
        const next = !micEnabled;
        streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next; });
        setMicEnabled(next);
    };

    const requestPermissions = async () => {
        setPermState('checking');
        setPermError(null);
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = s;
            setStream(s);
            setPermState('granted');
            setShowPermModal(false);
        } catch (err) {
            setPermState('denied');
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermError(
                    'Camera and microphone access was denied. Please allow access in your browser settings, then try again.'
                );
            } else if (err.name === 'NotFoundError') {
                setPermError('No camera or microphone found. Please connect a device and try again.');
            } else {
                setPermError('Could not access camera or microphone. Please check your devices and try again.');
            }
        }
    };

    const handleJoin = async () => {
        try {
            setJoining(true);
            setJoinError(null);

            // 1. Signal Django that session is starting
            await api.post(`/interviews/candidate/${interview.room_id}/start/`, {});

            // 2. Get LiveKit token from Django backend. Never log it: it grants access to the room.
            const lkData = await rtcApi.getJoinToken(token);

            setLkToken(lkData.token);
            setRole(lkData.role);
            setLkData(lkData); // Store full data including serverUrl
        } catch (err) {
            setJoinError(err.message || 'Please try again.');
        } finally {
            setJoining(false);
        }
    };

    if (loading) return <JoinInterviewSkeleton />;

    if (error) {
        return (
            <CenteredScreen>
                {/* A fetch that never reached the server isn't an access problem; don't tell the candidate their link is bad. */}
                {/failed to fetch|network/i.test(error) ? (
                    <ErrorState title="Can't reach the interview server" message="Check your connection, then try again." onRetry={() => window.location.reload()} />
                ) : (
                    <ErrorState title="This interview link can't be opened" message={error} onRetry={() => window.location.reload()} />
                )}
            </CenteredScreen>
        );
    }

    if (lkToken) {
        const serverUrl = lkData?.serverUrl || LIVEKIT_URL;

        if (!serverUrl.startsWith('ws://') && !serverUrl.startsWith('wss://')) {
            console.error('[LiveKit] Invalid serverUrl:', serverUrl);
            return (
                <CenteredScreen>
                    <ErrorState
                        title="Configuration error"
                        message={`Invalid LiveKit URL: ${serverUrl}. Must start with ws:// or wss://`}
                    />
                </CenteredScreen>
            );
        }

        return (
            <div className="h-dvh w-full bg-black">
                <LiveKitRoom
                    video={true}
                    audio={true}
                    token={lkToken}
                    serverUrl={serverUrl}
                    connect={true}
                    data-lk-theme="default"
                    onError={(error) => {
                        console.error('[LiveKit] Connection error:', error?.message);
                        setError(`LiveKit Connection Failed: ${error.message || 'Unknown error'}`);
                    }}
                    onDisconnected={() => {
                        router.push(role === 'CANDIDATE' ? '/candidate/interview' : '/recruiter/interview');
                    }}
                >
                    <ActiveInterviewRoom interview={interview} role={role} />
                </LiveKitRoom>
            </div>
        );
    }

    const permChip = PERM_CHIP[permState];

    return (
        <>
            {/* Permission Grant Modal Overlay */}
            <AnimatePresence>
                {showPermModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={base}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    >
                        <motion.dialog
                            open
                            aria-modal="true"
                            aria-labelledby="perm-modal-title"
                            initial={{ opacity: 0, scale: 0.98, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 8 }}
                            transition={base}
                            className={`${card} relative m-0 max-h-[90dvh] w-full max-w-lg space-y-6 overflow-y-auto p-5 text-foreground shadow-md sm:p-6`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`${iconTile} h-12 w-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                                    <HiOutlineCamera className="h-6 w-6" aria-hidden="true" />
                                </span>
                                <div>
                                    <h2 id="perm-modal-title" className="text-lg font-semibold sm:text-xl">Camera and microphone access</h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Required for the live interview session</p>
                                </div>
                            </div>

                            {permState === 'denied' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={base}
                                    role="alert"
                                    className="space-y-3 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10"
                                >
                                    <p className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
                                        <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
                                        Permission denied
                                    </p>
                                    <p className="text-xs text-red-700/90 dark:text-red-300/90">{permError}</p>
                                    <ol className="list-inside list-decimal space-y-1 rounded-md bg-card p-3 text-xs text-muted-foreground">
                                        <li>Click the camera or lock icon in your browser address bar</li>
                                        <li>Set Camera and Microphone to <strong className="text-foreground">Allow</strong></li>
                                        <li>Reload the page and try again</li>
                                    </ol>
                                </motion.div>
                            )}

                            {permState !== 'denied' && (
                                <ul className="space-y-2">
                                    <CheckRow icon={HiOutlineVideoCamera} title="Camera" text="Required for the video feed" chip={permChip} />
                                    <CheckRow icon={HiOutlineMicrophone} title="Microphone" text="Required for audio" chip={permChip} />
                                    <CheckRow icon={HiOutlineLockClosed} title="Encrypted connection" text="Audio and video are encrypted in transit" />
                                </ul>
                            )}

                            <div className="space-y-3">
                                {permState === 'denied' ? (
                                    <>
                                        <button type="button" onClick={requestPermissions} className={`${primaryButton} w-full`}>
                                            <HiOutlineArrowPath className="h-5 w-5" aria-hidden="true" />
                                            Try again
                                        </button>
                                        <button type="button" onClick={() => window.location.reload()} className={`${secondaryButton} w-full`}>
                                            Reload page
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={requestPermissions}
                                        disabled={permState === 'checking'}
                                        className={`${primaryButton} w-full`}
                                    >
                                        {permState === 'checking' ? <Spinner /> : <HiOutlineShieldCheck className="h-5 w-5" aria-hidden="true" />}
                                        {permState === 'checking' ? 'Waiting for your browser...' : 'Allow camera and microphone'}
                                    </button>
                                )}
                                <p className="text-center text-xs text-muted-foreground">
                                    Your browser will ask to use your camera and microphone. Both are required to take part in the live interview.
                                </p>
                            </div>
                        </motion.dialog>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`${PAGE} flex flex-col gap-6`}>
                <motion.header {...fadeUp} transition={base} className="flex items-center gap-3">
                    <span className={`${iconTile} h-10 w-10 border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400`}>
                        <HiOutlineVideoCamera className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Interview lobby</p>
                        <p className="truncate text-sm text-muted-foreground">Check your camera and microphone, then join when you are ready.</p>
                    </div>
                </motion.header>

                <div className="grid flex-1 gap-6 lg:grid-cols-12 lg:items-center">
                    {/* Preview */}
                    <motion.section {...fadeUp} transition={{ ...base, delay: 0.04 }} aria-label="Camera preview" className="min-w-0 space-y-4 lg:col-span-7 2xl:col-span-8">
                        <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-zinc-950">
                            {/* Kept mounted so the stream survives hiding and showing the preview. */}
                            {stream && (
                                <video autoPlay playsInline muted ref={videoRef} className="h-full w-full scale-x-[-1] object-cover" />
                            )}
                            {(!stream || !camEnabled) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950 text-center">
                                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                                        <HiOutlineVideoCameraSlash className="h-8 w-8 text-zinc-500" aria-hidden="true" />
                                    </span>
                                    <p className="text-sm font-medium text-zinc-400">
                                        {stream ? 'Preview hidden' : 'Camera not connected yet'}
                                    </p>
                                </div>
                            )}
                            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-sm bg-black/70 px-2 py-1 text-xs font-medium text-white">
                                <span className={`h-2 w-2 rounded-full ${stream ? 'bg-emerald-400' : 'bg-zinc-500'}`} aria-hidden="true" />
                                Preview
                            </span>
                        </div>

                        {stream && (
                            <div className="space-y-2">
                                <div className="flex flex-wrap justify-center gap-3">
                                    <PreviewToggle on={camEnabled} onClick={() => setCamEnabled(!camEnabled)} onIcon={HiOutlineVideoCamera} offIcon={HiOutlineVideoCameraSlash} label="Camera preview" />
                                    <PreviewToggle on={micEnabled} onClick={toggleMicPreview} onIcon={HiOutlineMicrophone} offIcon={HiOutlineMicrophone} label="Mic preview" />
                                </div>
                                <p className="flex items-start justify-center gap-1.5 text-center text-xs text-muted-foreground">
                                    <HiOutlineInformationCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
                                    These toggles only change this preview. You join with camera and microphone on, and can turn them off inside the room.
                                </p>
                            </div>
                        )}
                    </motion.section>

                    {/* Details + join */}
                    <motion.section {...fadeUp} transition={{ ...base, delay: 0.08 }} aria-labelledby="lobby-title" className={`${card} min-w-0 space-y-6 p-5 lg:col-span-5 lg:p-6 2xl:col-span-4`}>
                        <div className="space-y-3">
                            <span className={`${badge} bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`}>
                                <HiOutlineSignal className="h-3.5 w-3.5" aria-hidden="true" /> Ready to start
                            </span>
                            <h1 id="lobby-title" className="text-2xl font-semibold tracking-tight lg:text-3xl">Live interview session</h1>
                            <p className="text-sm text-muted-foreground">
                                {interview?.candidate_instructions || "You've been invited to a live technical interview. Join the room when you're ready."}
                            </p>
                        </div>

                        <ul className="space-y-2">
                            <CheckRow icon={HiOutlineVideoCamera} title="Camera" text="Used for your video feed" chip={permChip} />
                            <CheckRow icon={HiOutlineMicrophone} title="Microphone" text="Used for audio" chip={permChip} />
                        </ul>

                        <dl className="divide-y divide-border rounded-md border border-border">
                            <div className="flex items-center justify-between gap-3 p-3">
                                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <HiOutlineEnvelope className="h-4 w-4" aria-hidden="true" /> Candidate
                                </dt>
                                <dd className="min-w-0 truncate text-sm font-semibold">{interview?.candidate_details?.email || '—'}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3 p-3">
                                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <HiOutlineSignal className="h-4 w-4" aria-hidden="true" /> Status
                                </dt>
                                <dd className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                                    {interview?.status || '—'}
                                </dd>
                            </div>
                        </dl>

                        {joinError && (
                            <p role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                                <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                <span>Failed to join session: {joinError}</span>
                            </p>
                        )}

                        <div className="space-y-3">
                            <button type="button" onClick={handleJoin} disabled={joining} className={`${primaryButton} min-h-12 w-full text-base`}>
                                {joining ? <Spinner /> : null}
                                {joining ? 'Connecting...' : 'Join interview room'}
                                {!joining && <HiOutlineArrowRight className="h-5 w-5" aria-hidden="true" />}
                            </button>
                            <p className="text-center text-xs text-muted-foreground">
                                By joining, you agree to our terms of service regarding recorded sessions.
                            </p>
                        </div>
                    </motion.section>
                </div>
            </div>
        </>
    );
}
