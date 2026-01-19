import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        fontSize: 9.5,
        lineHeight: 1.4,
        color: '#334155',
    },

    // Header section
    header: {
        marginBottom: 20,
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
        letterSpacing: -0.5,
    },
    label: {
        fontSize: 18,
        color: '#3b82f6', // Bright Blue from image
        fontWeight: 'bold',
        marginTop: 22,
        marginBottom: 18,
    },
    contactRow: {
        flexDirection: 'row',
        gap: 15,
        fontSize: 12,
        color: '#475569',
    },

    // Main Container
    container: {
        flexDirection: 'row',
        gap: 30,
    },

    // Left Column (Wider)
    mainColumn: {
        flex: 1.6,
    },

    // Right Column (Narrower)
    sideColumn: {
        flex: 1,
    },

    // Section Styling
    section: {
        marginTop: 15,
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        borderBottomWidth: 1.5,
        borderBottomColor: '#000000',
        paddingBottom: 3,
        marginBottom: 8,
    },

    // Summary
    summary: {
        fontSize: 9,
        lineHeight: 1.5,
        textAlign: 'justify',
    },

    // Items (Experience, Education)
    item: {
        marginBottom: 12,
    },
    itemTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000000',
    },
    itemSubtitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#3b82f6',
        marginTop: 1,
    },
    itemInfo: {
        flexDirection: 'row',
        gap: 10,
        fontSize: 8,
        color: '#94a3b8',
        marginTop: 2,
        marginBottom: 4,
    },
    highlights: {
        marginLeft: 10,
    },
    highlight: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    bullet: {
        width: 10,
        fontSize: 11,
        color: '#64748b',
    },
    highlightText: {
        flex: 1,
        fontSize: 8.5,
        color: '#475569',
    },

    // Side Column Special Styles
    strengthBox: {
        marginBottom: 12,
    },
    strengthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    strengthTitle: {
        fontSize: 9.5,
        fontWeight: 'bold',
        color: '#000000',
    },
    strengthDesc: {
        fontSize: 8,
        color: '#64748b',
        marginLeft: 16,
    },
    checkIcon: {
        color: '#3b82f6',
        fontSize: 10,
        fontWeight: 'bold',
    },

    skillItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 4,
        marginBottom: 6,
        width: '100%',
    },
    skillText: {
        fontSize: 8.5,
        color: '#1e293b',
        fontWeight: 'bold',
    },

    languageRow: {
        marginBottom: 10,
    },
    langHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    langName: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    langFluency: {
        fontSize: 8,
        color: '#64748b',
        fontStyle: 'italic',
    },
    dotContainer: {
        flexDirection: 'row',
        gap: 3,
        marginTop: 2,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#3b82f6',
    },
    dotEmpty: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#e2e8f0',
    },

    link: {
        textDecoration: 'none',
        color: '#475569',
    }
});

const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    if (dateStr.length === 4 && !isNaN(dateStr)) return dateStr;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Helper for language dots
const Dots = ({ level }) => {
    const levels = { 'Native': 5, 'Fluent': 5, 'Professional': 4, 'Advanced': 4, 'Intermediate': 3, 'Basic': 2 };
    const fill = levels[level] || 3;
    return (
        <View style={styles.dotContainer}>
            {[1, 2, 3, 4, 5].map(i => (
                <View key={i} style={i <= fill ? styles.dot : styles.dotEmpty} />
            ))}
        </View>
    );
};

const ModernResume = ({ data }) => {
    const { basics, experience, projects, skills, education, certifications, languages } = data;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{basics?.name}</Text>
                    <Text style={styles.label}>{basics?.label}</Text>
                    <View style={styles.contactRow}>
                        {basics?.email && <Text>{basics.email}</Text>}
                        {basics?.links?.find(l => l.label.toLowerCase().includes('linkedin')) && (
                            <Text>linkedin.com</Text>
                        )}
                        {basics?.location && <Text>{basics.location.city}, {basics.location.country}</Text>}
                    </View>
                </View>

                <View style={styles.container}>
                    {/* LEFT COLUMN */}
                    <View style={styles.mainColumn}>
                        {basics?.summary && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Summary</Text>
                                <Text style={styles.summary}>{basics.summary}</Text>
                            </View>
                        )}

                        {experience && experience.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Experience</Text>
                                {experience.map((exp, idx) => (
                                    <View key={idx} style={styles.item}>
                                        {exp.roles?.map((role, rIdx) => (
                                            <View key={rIdx} style={{ marginBottom: 8 }}>
                                                <Text style={styles.itemTitle}>{role.title}</Text>
                                                <Text style={styles.itemSubtitle}>{exp.company}</Text>
                                                <View style={styles.itemInfo}>
                                                    <Text>{formatDate(role.startDate)} — {role.isCurrent ? 'Present' : formatDate(role.endDate)}</Text>
                                                    <Text>|</Text>
                                                    <Text>{exp.location}</Text>
                                                </View>
                                                {role.highlights && (
                                                    <View style={styles.highlights}>
                                                        {role.highlights.map((h, hIdx) => (
                                                            <View key={hIdx} style={styles.highlight}>
                                                                <Text style={styles.bullet}>•</Text>
                                                                <Text style={styles.highlightText}>{h}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        )}

                        {education && education.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Education</Text>
                                {education.map((edu, idx) => (
                                    <View key={idx} style={styles.item}>
                                        <Text style={styles.itemTitle}>{edu.studyType} In {edu.area}</Text>
                                        <Text style={styles.itemSubtitle}>{edu.institution}</Text>
                                        <View style={styles.itemInfo}>
                                            <Text>{edu.startDate} — {edu.endDate}</Text>
                                            <Text>|</Text>
                                            <Text>{edu.score ? `GPA: ${edu.score}` : ''}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {languages && languages.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Languages</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                                    {languages.map((lang, idx) => (
                                        <View key={idx} style={styles.languageRow}>
                                            <View style={styles.langHeader}>
                                                <Text style={styles.langName}>{lang.language}</Text>
                                            </View>
                                            <Text style={styles.langFluency}>{lang.fluency}</Text>
                                            <Dots level={lang.fluency} />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* RIGHT COLUMN */}
                    <View style={styles.sideColumn}>
                        {/* STRENGTHS (Simulated from Project Highlights or common traits) */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Strengths</Text>
                            <View style={styles.strengthBox}>
                                <View style={styles.strengthHeader}>
                                    <Text style={styles.checkIcon}>✓</Text>
                                    <Text style={styles.strengthTitle}>Creative Visionary</Text>
                                </View>
                                <Text style={styles.strengthDesc}>Driving visual style and engagement through inspired design solutions.</Text>
                            </View>
                            <View style={styles.strengthBox}>
                                <View style={styles.strengthHeader}>
                                    <Text style={styles.checkIcon}>✓</Text>
                                    <Text style={styles.strengthTitle}>Effective Collaborator</Text>
                                </View>
                                <Text style={styles.strengthDesc}>Thriving in diverse teams to achieve large-scale objectives.</Text>
                            </View>
                            <View style={styles.strengthBox}>
                                <View style={styles.strengthHeader}>
                                    <Text style={styles.checkIcon}>✓</Text>
                                    <Text style={styles.strengthTitle}>Detail Oriented</Text>
                                </View>
                                <Text style={styles.strengthDesc}>Ensuring precision in final deliverables across all projects.</Text>
                            </View>
                        </View>

                        {skills && skills.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Skills</Text>
                                <View style={{ gap: 4 }}>
                                    {skills.flatMap(g => g.keywords).slice(0, 10).map((skill, idx) => (
                                        <View key={idx} style={styles.skillItem}>
                                            <Text style={styles.skillText}>{skill}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {certifications && certifications.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Certification</Text>
                                {certifications.map((cert, idx) => (
                                    <View key={idx} style={{ marginBottom: 8 }}>
                                        <Text style={[styles.itemSubtitle, { fontSize: 9, marginBottom: 2 }]}>{cert.name}</Text>
                                        <Text style={{ fontSize: 8, color: '#64748b' }}>{cert.issuer}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default ModernResume;