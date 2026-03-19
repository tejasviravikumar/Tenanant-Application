/**
 * generateReceipt.js
 *
 * Generates a clean payment receipt PDF entirely in the browser
 * using jsPDF (no backend call needed — data is already in state).
 *
 * Install:  npm install jspdf
 * Usage:    import { generateReceipt } from "./generateReceipt";
 *           generateReceipt(payment, user, apartment);
 */

import { jsPDF } from "jspdf";

/**
 * @param {object} payment   - Payment row from the payments table
 * @param {object} user      - UserDetails from /api/profile
 * @param {object} apartment - Apartment from user.apartment
 */
export function generateReceipt(payment, user, apartment) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const W  = 210;   // page width  (A4)
  const ml = 20;    // margin left
  const mr = W - 20; // margin right

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fmt = (n) =>
    n != null ? `Rs. ${Number(n).toLocaleString("en-IN")}` : "Rs. 0";

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit", month: "long", year: "numeric",
        })
      : "—";

  const total =
    (payment.rentAmount    ?? 0) +
    (payment.maintenanceFee ?? 0) +
    (payment.additionalFee  ?? 0);

  const isPaid = payment.rentPaid && payment.maintenancePaid;

  // ── Background header block ───────────────────────────────────────────────
  doc.setFillColor(34, 69, 163);          // deep blue
  doc.rect(0, 0, W, 42, "F");

  // Property name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(apartment?.propertyName ?? "Skyview Apartments", ml, 16);

  // Sub-label
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 255);
  doc.text("PAYMENT RECEIPT", ml, 23);

  // Receipt number  (right-aligned)
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Receipt #REC-${payment.id ?? "000"}`, mr, 16, { align: "right" });
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
    mr, 23, { align: "right" }
  );

  // Status badge
  const badgeColor = isPaid ? [22, 163, 74] : [220, 38, 38]; // green / red
  doc.setFillColor(...badgeColor);
  doc.roundedRect(mr - 22, 28, 22, 9, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(isPaid ? "PAID" : "UNPAID", mr - 11, 34, { align: "center" });

  // ── Tenant info block ─────────────────────────────────────────────────────
  let y = 54;

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(ml, y, W - 40, 30, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("TENANT DETAILS", ml + 5, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const tenantName = `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() || "—";
  doc.text(`Name      :  ${tenantName}`,                                   ml + 5, y + 15);
  doc.text(`Apartment :  Unit ${apartment?.apartmentNumber ?? "—"}, ${apartment?.propertyName ?? "—"}`, ml + 5, y + 21);
  doc.text(`Email     :  ${user?.email ?? "—"}`,                           ml + 5, y + 27);

  // ── Divider ───────────────────────────────────────────────────────────────
  y += 38;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(ml, y, mr, y);

  // ── Payment period ────────────────────────────────────────────────────────
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Payment for: ${payment.month ?? "—"}`, ml, y);

  if (payment.paymentDate) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Paid on: ${fmtDate(payment.paymentDate)}`, mr, y, { align: "right" });
  }

  // ── Breakdown table ───────────────────────────────────────────────────────
  y += 10;

  // Table header
  doc.setFillColor(34, 69, 163);
  doc.rect(ml, y, W - 40, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("Description",  ml + 4, y + 6);
  doc.text("Amount",       mr - 4,  y + 6, { align: "right" });

  const rows = [
    { label: "Rent",                value: payment.rentAmount,     paid: payment.rentPaid },
    { label: "Maintenance Fee",     value: payment.maintenanceFee, paid: payment.maintenancePaid },
    { label: "Additional Charges",  value: payment.additionalFee,  paid: true },
  ].filter(r => r.value != null && r.value > 0);

  rows.forEach((row, i) => {
    y += 9;
    const bg = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(...bg);
    doc.rect(ml, y, W - 40, 9, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(row.label, ml + 4, y + 6);
    doc.text(fmt(row.value), mr - 4, y + 6, { align: "right" });

    // Paid / Unpaid tag per row
    const tagColor = row.paid ? [22, 163, 74] : [220, 38, 38];
    doc.setFontSize(7);
    doc.setTextColor(...tagColor);
    doc.text(row.paid ? "✓ Paid" : "✗ Unpaid", mr - 35, y + 6);
  });

  // ── Total row ─────────────────────────────────────────────────────────────
  y += 9;
  doc.setFillColor(34, 69, 163);
  doc.rect(ml, y, W - 40, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Total",     ml + 4,  y + 7);
  doc.text(fmt(total),  mr - 4,  y + 7, { align: "right" });

  // ── Due date note (if unpaid) ─────────────────────────────────────────────
  if (!isPaid && payment.lastDateToPay) {
    y += 16;
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(ml, y, W - 40, 10, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28);
    doc.text(
      `Payment due by ${fmtDate(payment.lastDateToPay)}. Late payments attract a penalty.`,
      ml + 4, y + 7
    );
  }

  // ── Lease info ────────────────────────────────────────────────────────────
  y += isPaid ? 18 : 20;
  doc.setDrawColor(226, 232, 240);
  doc.line(ml, y, mr, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  const leaseStart = apartment?.leaseStart
    ? new Date(apartment.leaseStart).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";
  const leaseEnd = apartment?.leaseEnd
    ? new Date(apartment.leaseEnd).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";

  doc.text(`Lease Period : ${leaseStart} – ${leaseEnd}`, ml, y);
  doc.text(`Monthly Rent : ${fmt(apartment?.monthlyRent)}`, ml, y + 6);
  doc.text(`Advance Paid : ${fmt(apartment?.advancePaid)}`, ml, y + 12);

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFillColor(34, 69, 163);
  doc.rect(0, 275, W, 22, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 255);
  doc.text(
    "This is a computer-generated receipt and does not require a physical signature.",
    W / 2, 284, { align: "center" }
  );
  doc.setTextColor(255, 255, 255);
  doc.text(
    `${apartment?.propertyName ?? "Skyview Apartments"} • All rights reserved`,
    W / 2, 291, { align: "center" }
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `receipt-${(payment.month ?? "payment").replace(/\s+/g, "-")}-${payment.id ?? "0"}.pdf`;
  doc.save(filename);
}