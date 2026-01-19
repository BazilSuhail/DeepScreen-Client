import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        color: '#1a1a1a',
    },

    // Left Sidebar
    sidebar: {
        width: '32%',
        backgroundColor: '#3e2723', // Deep coffee brown
        padding: 25,
        color: '#ffffff',
        height: '100%',
    },
    sidebarSection: {
        marginBottom: 20,
    },
    sidebarTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        borderBottom: '1pt solid rgba(255, 255, 255, 0.2)',
        paddingBottom: 4,
        marginBottom: 10,
        color: '#d7ccc8', // Light brown/cream
    },
    sidebarItem: {
        fontSize: 8.5,
        marginBottom: 6,
        lineHeight: 1.3,
    },
    skillGroup: {
        marginBottom: 10,
    },
    skillCategory: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#d7ccc8',
        marginBottom: 3,
    },
    skillText: {
        fontSize: 8,
        color: '#ffffff',
        lineHeight: 1.4,
    },

    // Main Content
    main: {
        width: '68%',
        padding: 35,
        paddingLeft: 30,
    },
    header: {
        marginBottom: 25,
    },
    name: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#3e2723',
        letterSpacing: 1,
    },
    label: {
        fontSize: 13,
        color: '#795548',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 6,
        fontWeight: 'bold',
    },
    summary: {
        fontSize: 9.5,
        lineHeight: 1.5,
        color: '#444',
        textAlign: 'justify',
        marginTop: 15,
    },

    section: {
        marginTop: 18,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#3e2723',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        borderBottom: '1.5pt solid #795548',
        paddingBottom: 2,
        marginBottom: 12,
    },

    experienceItem: {
        marginBottom: 15,
    },
    companyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    company: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#3e2723',
    },
    dates: {
        fontSize: 8.5,
        color: '#795548',
        fontWeight: 'bold',
    },
    role: {
        fontSize: 9.5,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginTop: 1,
        fontStyle: 'italic',
    },
    highlights: {
        marginTop: 6,
        marginLeft: 8,
    },
    highlight: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    bullet: {
        width: 10,
        color: '#795548',
        fontSize: 10,
    },
    highlightText: {
        flex: 1,
        fontSize: 9,
        lineHeight: 1.4,
        color: '#333',
    },

    projectItem: {
        marginBottom: 10,
    },
    projectName: {
        fontSize: 10.5,
        fontWeight: 'bold',
        color: '#3e2723',
    },
});

const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    if (dateStr.length === 4 && !isNaN(dateStr)) return dateStr;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const ExecutiveResume = ({ data }) => {
    const { basics, experience, projects, skills, education, certifications, languages } = data;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Left Column (Sidebar) */}
                <View style={styles.sidebar}>
                    {/* Contact Section */}
                    <View style={styles.sidebarSection}>
                        <Text style={styles.sidebarTitle}>Contact</Text>
                        {basics?.phone && <Text style={styles.sidebarItem}>{basics.phone}</Text>}
                        {basics?.email && <Text style={styles.sidebarItem}>{basics.email}</Text>}
                        {basics?.location && (
                            <Text style={styles.sidebarItem}>
                                {basics.location.city}, {basics.location.country}
                            </Text>
                        )}
                        {basics?.links?.map((link, idx) => (
                            <Link key={idx} src={link.url} style={[styles.sidebarItem, { textDecoration: 'none', color: '#ffffff' }]}>
                                {link.label}
                            </Link>
                        ))}
                    </View>

                    {/* Skills Section */}
                    {skills && skills.length > 0 && (
                        <View style={styles.sidebarSection}>
                            <Text style={styles.sidebarTitle}>Expertise</Text>
                            {skills.map((group, idx) => (
                                <View key={idx} style={styles.skillGroup}>
                                    <Text style={styles.skillCategory}>{group.category}</Text>
                                    <Text style={styles.skillText}>{group.keywords.join(' \u2022 ')}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Education Section */}
                    {education && education.length > 0 && (
                        <View style={styles.sidebarSection}>
                            <Text style={styles.sidebarTitle}>Education</Text>
                            {education.map((edu, idx) => (
                                <View key={idx} style={{ marginBottom: 10 }}>
                                    <Text style={[styles.sidebarItem, { fontWeight: 'bold', color: '#d7ccc8' }]}>{edu.institution}</Text>
                                    <Text style={styles.sidebarItem}>{edu.studyType}</Text>
                                    <Text style={[styles.sidebarItem, { fontStyle: 'italic', opacity: 0.8 }]}>{edu.endDate}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Languages */}
                    {languages && languages.length > 0 && (
                        <View style={styles.sidebarSection}>
                            <Text style={styles.sidebarTitle}>Languages</Text>
                            {languages.map((lang, idx) => (
                                <Text key={idx} style={styles.sidebarItem}>
                                    <Text style={{ fontWeight: 'bold', color: '#d7ccc8' }}>{lang.language}:</Text> {lang.fluency}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* Right Column (Main) */}
                <View style={styles.main}>
                    <View style={styles.header}>
                        <Text style={styles.name}>{basics?.name}</Text>
                        <Text style={styles.label}>{basics?.label}</Text>
                        {basics?.summary && <Text style={styles.summary}>{basics.summary}</Text>}
                    </View>

                    {/* Experience Section */}
                    {experience && experience.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Professional Experience</Text>
                            {experience.map((exp, idx) => (
                                <View key={idx} style={styles.experienceItem}>
                                    <View style={styles.companyHeader}>
                                        <Text style={styles.company}>{exp.company}</Text>
                                        <Text style={styles.dates}>{exp.location}</Text>
                                    </View>
                                    {exp.roles?.map((role, rIdx) => (
                                        <View key={rIdx} style={{ marginTop: 4 }}>
                                            <View style={styles.companyHeader}>
                                                <Text style={styles.role}>{role.title}</Text>
                                                <Text style={styles.dates}>
                                                    {formatDate(role.startDate)} — {role.isCurrent ? 'Present' : formatDate(role.endDate)}
                                                </Text>
                                            </View>
                                            {role.highlights && (
                                                <View style={styles.highlights}>
                                                    {role.highlights.map((bullet, bIdx) => (
                                                        <View key={bIdx} style={styles.highlight}>
                                                            <Text style={styles.bullet}>{'\u2023'}</Text>
                                                            <Text style={styles.highlightText}>{bullet}</Text>
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

                    {/* Projects Section */}
                    {projects && projects.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Strategic Projects</Text>
                            {projects.map((proj, idx) => (
                                <View key={idx} style={styles.projectItem}>
                                    <View style={styles.companyHeader}>
                                        <Text style={styles.projectName}>{proj.name}</Text>
                                        <Text style={styles.dates}>{formatDate(proj.startDate)}</Text>
                                    </View>
                                    <Text style={{ fontSize: 9, color: '#555', marginTop: 2, fontStyle: 'italic' }}>{proj.description}</Text>
                                    {proj.highlights && (
                                        <View style={[styles.highlights, { marginTop: 4 }]}>
                                            {proj.highlights.map((bullet, bIdx) => (
                                                <View key={bIdx} style={styles.highlight}>
                                                    <Text style={styles.bullet}>{'\u2023'}</Text>
                                                    <Text style={styles.highlightText}>{bullet}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Certifications Section */}
                    {certifications && certifications.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Certifications</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                                {certifications.map((cert, idx) => (
                                    <View key={idx} style={{ width: '45%', marginBottom: 8 }}>
                                        <Text style={[styles.projectName, { fontSize: 9.5 }]}>{cert.name}</Text>
                                        <Text style={[styles.dates, { fontWeight: 'normal' }]}>{cert.issuer} | {formatDate(cert.date)}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </Page>
        </Document>
    );
};

export default ExecutiveResume;