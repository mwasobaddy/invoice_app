import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#0f172a", color: "#bef264", padding: 16, borderRadius: 8, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold" },
  subtitle: { fontSize: 10, color: "#cbd5e1", marginTop: 4 },
  card: { backgroundColor: "#ffffff", borderRadius: 8, padding: 16, marginBottom: 12, border: "1px solid #e2e8f0" },
  label: { fontSize: 8, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: 1 },
  value: { fontSize: 11, color: "#0f172a", marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  lime: { backgroundColor: "#bef264", color: "#0f172a", padding: 12, borderRadius: 8 },
});

export function InvoicePDF({ invoice }: { invoice: { invoiceNo: string; clientName: string; clientEmail?: string | null; amount: string; currency: string; status: string; issueDate: string; dueDate: string; description?: string | null; items: Array<{ description: string; quantity: string; rate: string; amount: string }> } }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Invoice Atlas • Osmo</Text>
          <Text style={styles.subtitle}>Slate • Lime • Emerald • Built for clarity</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Invoice {invoice.invoiceNo}</Text>
          <Text style={[styles.value, { fontSize: 16, fontWeight: "bold" as const }]}>{invoice.clientName}</Text>
          {invoice.clientEmail ? <Text style={styles.value}>{invoice.clientEmail}</Text> : null}
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.value}>{invoice.currency} {invoice.amount}</Text>
            </View>
            <View>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>{invoice.status}</Text>
            </View>
            <View>
              <Text style={styles.label}>Due</Text>
              <Text style={styles.value}>{invoice.dueDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.lime}>
          <Text style={styles.label}>Items</Text>
          {invoice.items.map((it, i) => (
            <View key={i} style={[styles.row, { borderTop: "1px solid #0f172a", paddingTop: 6, marginTop: 6 }]}>
              <Text style={{ fontSize: 9, width: "50%" }}>{it.description}</Text>
              <Text style={{ fontSize: 9 }}>{it.quantity} × {it.rate}</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold" as const }}>{it.amount}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>Notes</Text>
          <Text style={[styles.value, { fontSize: 9 }]}>{invoice.description || "Thank you for your business."}</Text>
        </View>
      </Page>
    </Document>
  );
}
