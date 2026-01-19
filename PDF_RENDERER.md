# 📄 DeepScreen PDF Generation Protocol: @react-pdf/renderer

This document outlines the technical specifications and implementation patterns for the `@react-pdf/renderer` library within the DeepScreen ecosystem. This library is utilized for generating high-fidelity, downloadable candidate resumes.

---

## 🚀 Overview
`@react-pdf/renderer` is an advanced library for creating PDF files using React components. Unlike HTML-to-Canvas solutions, it generates actual PDF primitives (vectors), ensuring text is selectable, searchable, and crystal clear.

### Key Benefits for DeepScreen
*   **Emerald Aesthetics**: Direct mapping of our design system's hex codes into the PDF layout.
*   **Neural Consistency**: Ensures that the resume downloaded by a recruiter perfectly mirrors the candidate's digital profile.
*   **Calculated Layouts**: Uses the Flexbox engine (Yoga) for precise, multi-column resume structures.

---

## 🛠️ Core Component Registry

| Component | Purpose | Equivalent |
| :--- | :--- | :--- |
| `<Document>` | The root container of the PDF document. | `<html>` |
| `<Page>` | Defines a single page size (usually 'A4'). | - |
| `<View>` | The fundamental building block for layouts. | `<div>` |
| `<Text>` | The strictly required wrapper for all text data. | `<span>` / `<p>` |
| `<Image>` | Native support for profile photos and logos. | `<img>` |
| `<Link>` | Handles internal and external hyper-references. | `<a>` |

---

## 🎨 Styling Architecture
Styling is handled via the `StyleSheet.create` method, similar to React Native.

```javascript
const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Poppins' // Custom font loading required
    },
    header: {
        marginBottom: 20,
        borderBottom: '2pt solid #10b981', // Emerald Primary
        paddingBottom: 10
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a' // Slate-900
    }
});
```

---

## 🏗️ Implementation Pattern: Candidate Resume

### 1. Installation
```bash
npm install @react-pdf/renderer
```

### 2. Implementation Strategy in `app/candidate/resume/page.jsx`

To provide the best UX, we combine a **Browser Preview** with a **Download Action**.

```jsx
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import ResumeDocument from './ResumeDocument'; // The actual PDF structure

export default function ResumePage() {
    return (
        <div className="p-8 space-y-8">
            {/* Action Bar */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black">Resume Engine</h1>
                <PDFDownloadLink 
                    document={<ResumeDocument data={userData} />} 
                    fileName="resume.pdf"
                    className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold"
                >
                    {({ loading }) => (loading ? 'Generating...' : 'Download PDF')}
                </PDFDownloadLink>
            </div>

            {/* Live Preview */}
            <div className="h-[800px] border-2 border-slate-100 rounded-[32px] overflow-hidden bg-slate-50">
                <PDFViewer width="100%" height="100%" showToolbar={false}>
                    <ResumeDocument data={userData} />
                </PDFViewer>
            </div>
        </div>
    );
}
```

---

## ✨ Pro-Tips for Neural Resumes
1.  **Font Loading**: Use `Font.register()` to load your **Poppins** or **Inter** fonts for that "DeepScreen" feel in the PDF.
2.  **Svg Support**: You can use `<Svg>` and `<Path>` components if you need custom icons or separators.
3.  **Conditional Rendering**: Use standard React logic inside the `<View>` components to hide empty experience or education sections.
4.  **Automatic Page Breaks**: Use the `break` prop on components to ensure section headers don't get stranded at the bottom of a page.

---

*Document Managed by DeepScreen AI Core.*