import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { Svg, Path, Circle } from "@react-pdf/renderer";

const styles = StyleSheet.create({
 container: {
    flexDirection: "row",
    borderBottom: "1px solid #ccc",
    paddingTop: 4,      // ← was 7
    paddingBottom: 4,   // ← add this
    marginBottom: 6,    // ← add this
    width: "100%",
  },
  column: {
    flex: 1,
    paddingHorizontal: 4,
    borderRight: "1px solid #ccc",
    minWidth: 0,
  },
  lastColumn: {
    flex: 1,
    paddingHorizontal: 2,
    minWidth: 0,
  },
  iconWrapper: {
    marginBottom: 3,
  },
  value: {
    fontSize: 9,
    lineHeight: 1.4,
  },
});

const WebsiteIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24">
    <Path
      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
      stroke="#4a90a4"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
      stroke="#4a90a4"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24">
    <Path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"
      stroke="#4a90a4"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EmailIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" stroke="#4a90a4" strokeWidth="2" fill="none" />
    <Path
      d="M2 12h4M18 12h4M12 2v4M12 18v4"
      stroke="#4a90a4"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);

const HeaderSection = ({ customerDetails }: any) => (
  <View style={styles.container}>
    <View style={styles.column}>
      <View style={styles.iconWrapper}>
        <WebsiteIcon />
      </View>
      <Text style={styles.value}>
        {customerDetails?.company_website ?? ""}
      </Text>
    </View>

    <View style={styles.column}>
      <View style={styles.iconWrapper}>
        <PhoneIcon />
      </View>
      <Text style={styles.value}>
        {customerDetails?.company_phone ?? ""}{"\n"}
        Office Hours{"\n"}Mon - Fri 9 AM - 4 PM
      </Text>
    </View>

    <View style={styles.lastColumn}>
      <View style={styles.iconWrapper}>
        <EmailIcon />
      </View>
      <Text style={styles.value}>
        {customerDetails?.company_email ?? ""}
      </Text>
    </View>
  </View>
);

export default HeaderSection;