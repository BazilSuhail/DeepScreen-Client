import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';

// Professional LaTeX-inspired styles with emerald accents
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1e293b', // slate-800
  },

  // Header Section
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #10b981', // emerald-500
    paddingBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a', // slate-900
    marginBottom: 22,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    color: '#059669', // emerald-600
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    fontSize: 9,
    color: '#475569', // slate-600
  },
  separator: {
    marginHorizontal: 4,
    color: '#cbd5e1',
  },

  // Layout Columns
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  mainColumn: {
    width: '65%',
    paddingRight: 20,
  },
  sideColumn: {
    width: '35%',
    paddingLeft: 20,
    borderLeft: '1pt solid #10b981', // Emerald separator
  },

  // Section Headers
  section: {
    marginTop: 15,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingBottom: 3,
    borderBottom: '1pt solid #d1fae5', // emerald-100
  },

  // Content Styles
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#334155',
    textAlign: 'justify',
  },

  experienceItem: {
    marginBottom: 12,
  },
  company: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  role: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 2,
  },
  dates: {
    fontSize: 8.5,
    color: '#64748b',
    fontWeight: 'bold',
    marginTop: 1,
  },
  highlights: {
    marginTop: 5,
    marginLeft: 8,
  },
  highlight: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 10,
    color: '#10b981',
    fontSize: 11,
  },
  highlightText: {
    flex: 1,
    fontSize: 9.5,
  },

  // Side Column Items
  sidebarSection: {
    marginBottom: 18,
  },
  skillCategory: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  skillList: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
  },
  educationItem: {
    marginBottom: 10,
  },
  institution: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  eduDetails: {
    fontSize: 8.5,
    color: '#475569',
    marginTop: 2,
  },

  link: {
    color: '#059669',
    textDecoration: 'none',
  },
});

const formatDate = (dateStr) => {
  if (!dateStr) return 'Present';
  if (dateStr.length === 4 && !isNaN(dateStr)) return dateStr;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const CreativeResume = ({ data }) => {
  const { basics, experience, projects, skills, education, certifications, languages } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.name}>{basics?.name}</Text>
          <Text style={styles.label}>{basics?.label}</Text>

          <View style={styles.contactInfo}>
            {basics?.email && <Text>{basics.email}</Text>}
            {basics?.phone && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text>{basics.phone}</Text>
              </>
            )}
            {basics?.location && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text>{basics.location.city}, {basics.location.country}</Text>
              </>
            )}
            {basics?.links?.map((link, idx) => (
              <View key={idx} style={{ flexDirection: 'row' }}>
                <Text style={styles.separator}>•</Text>
                <Link src={link.url} style={styles.link}>{link.label}</Link>
              </View>
            ))}
          </View>
        </View>

        {/* Two Column Layout */}
        <View style={styles.container}>
          {/* Main Column (Left) */}
          <View style={styles.mainColumn}>
            {/* Summary */}
            {basics?.summary && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Professional Summary</Text>
                <Text style={styles.summary}>{basics.summary}</Text>
              </View>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Professional Experience</Text>
                {experience.map((exp, idx) => (
                  <View key={idx} style={styles.experienceItem}>
                    <Text style={styles.company}>{exp.company}</Text>
                    {exp.roles?.map((role, rIdx) => (
                      <View key={rIdx} style={{ marginTop: 4 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={styles.role}>{role.title}</Text>
                          <Text style={styles.dates}>
                            {formatDate(role.startDate)} — {role.isCurrent ? 'Present' : formatDate(role.endDate)}
                          </Text>
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

            {/* Projects */}
            {projects && projects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Notable Projects</Text>
                {projects.map((proj, idx) => (
                  <View key={idx} style={styles.experienceItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.company}>{proj.name}</Text>
                      <Text style={styles.dates}>{formatDate(proj.startDate)}</Text>
                    </View>
                    {proj.highlights && (
                      <View style={styles.highlights}>
                        {proj.highlights.map((h, hIdx) => (
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
            )}
          </View>

          {/* Side Column (Right) */}
          <View style={styles.sideColumn}>
            {/* Skills */}
            {skills && skills.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sectionHeader}>Technical Skills</Text>
                {skills.map((group, idx) => (
                  <View key={idx} style={{ marginBottom: 8 }}>
                    <Text style={styles.skillCategory}>{group.category}</Text>
                    <Text style={styles.skillList}>{group.keywords.join(' \u2022 ')}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sectionHeader}>Education</Text>
                {education.map((edu, idx) => (
                  <View key={idx} style={styles.educationItem}>
                    <Text style={styles.institution}>{edu.institution}</Text>
                    <Text style={styles.eduDetails}>{edu.studyType} in {edu.area}</Text>
                    <Text style={styles.eduDetails}>{edu.endDate}</Text>
                    {edu.score && <Text style={styles.eduDetails}>GPA: {edu.score}</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sectionHeader}>Certifications</Text>
                {certifications.map((cert, idx) => (
                  <View key={idx} style={{ marginBottom: 6 }}>
                    <Text style={styles.institution}>{cert.name}</Text>
                    <Text style={styles.eduDetails}>{cert.issuer}</Text>
                    <Text style={styles.eduDetails}>{formatDate(cert.date)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sectionHeader}>Languages</Text>
                {languages.map((lang, idx) => (
                  <Text key={idx} style={styles.skillList}>
                    <Text style={{ fontWeight: 'bold' }}>{lang.language}:</Text> {lang.fluency}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CreativeResume;
