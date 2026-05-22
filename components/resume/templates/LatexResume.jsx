import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

// Register fonts if needed, but Helvetica is default
const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.3,
    color: '#000000',
  },

  // Header Section
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 26,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    fontSize: 10.5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: 4,
  },

  // Section Headers
  section: {
    marginTop: 12,
    marginBottom: 6,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    marginBottom: 6,
  },

  // Common Item Layout
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
  },
  itemSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontStyle: 'italic',
    fontSize: 10.5,
    marginBottom: 2,
  },

  // Bullets
  highlights: {
    marginLeft: 15,
    marginTop: 2,
  },
  highlight: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 10.5,
  },
  bullet: {
    width: 12,
    fontSize: 11,
  },
  highlightText: {
    flex: 1,
    textAlign: 'justify',
  },

  // Projects
  projectTitle: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  projectKeywords: {
    fontSize: 10,
  },

  // Skills
  skillRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 10.5,
  },
  skillLabel: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  skillContent: {
    flex: 1,
  },

  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
});

const formatDate = (dateStr) => {
  if (!dateStr) return 'Present';
  // Check if it's just a year
  if (dateStr.length === 4 && !isNaN(dateStr)) return dateStr;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const LatexResume = ({ data }) => {
  const { basics, experience, projects, skills, education } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{basics?.name}</Text>
          <View style={styles.contactInfo}>
            {basics?.phone && <Text>{basics.phone}</Text>}
            {basics?.phone && basics?.email && <Text style={styles.separator}>|</Text>}
            {basics?.email && <Text>{basics.email}</Text>}
            {basics?.links?.map((link, idx) => (
              <View key={idx} style={{ flexDirection: 'row' }}>
                <Text style={styles.separator}>|</Text>
                <Link src={link.url} style={{ color: '#000000', textDecoration: 'none', marginLeft: 10 }}>
                  {link.label}
                </Link>
              </View>
            ))}
          </View>
        </View>

        {/* Education Section */}
        {education && education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={{ marginBottom: 6 }}>
                <View style={styles.itemHeader}>
                  <Text style={styles.bold}>{edu.institution}</Text>
                  <Text>{edu.startDate} – {edu.endDate}</Text>
                </View>
                <View style={styles.itemSubHeader}>
                  <Text>{edu.studyType} in {edu.area} {edu.score ? `(GPA: ${edu.score})` : ''}</Text>
                  <Text>{basics?.location?.city || ''}</Text>
                </View>
                {edu.courses && edu.courses.length > 0 && (
                  <View style={styles.highlight}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.highlightText}>
                      <Text style={styles.bold}>Relevant Coursework: </Text>
                      {edu.courses.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Experience Section */}
        {experience && experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Experience</Text>
            {experience.map((exp, idx) => (
              <View key={idx} style={{ marginBottom: 8 }}>
                {exp.roles?.map((role, rIdx) => (
                  <View key={rIdx} style={{ marginBottom: 4 }}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.bold}>{exp.company}</Text>
                      <Text>{formatDate(role.startDate)} – {role.isCurrent ? 'Present' : formatDate(role.endDate)}</Text>
                    </View>
                    <View style={styles.itemSubHeader}>
                      <Text>{role.title}</Text>
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

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Projects</Text>
            {projects.map((project, idx) => (
              <View key={idx} style={{ marginBottom: 6 }}>
                <View style={styles.itemHeader}>
                  <Text>
                    <Text style={styles.bold}>{project.name}</Text>
                    {project.keywords && (
                      <Text style={styles.projectKeywords}> | {project.keywords.join(', ')}</Text>
                    )}
                  </Text>
                  {/* Dates for projects if needed, though often omitted in this style */}
                </View>
                {project.highlights && (
                  <View style={styles.highlights}>
                    {project.highlights.map((h, hIdx) => (
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

        {/* Technical Skills Section */}
        {skills && skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Technical Skills</Text>
            {skills.map((skillGroup, idx) => (
              <View key={idx} style={styles.skillRow}>
                <Text style={styles.skillLabel}>{skillGroup.category}:</Text>
                <Text style={styles.skillContent}>{skillGroup.keywords.join(', ')}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default LatexResume;

