import * as XLSX from "xlsx"
import saveAs from "file-saver"
import dayjs from "dayjs"

export interface ExportTicketItem {
	id: number
	ticket_number: string
	customer?: { name?: string; phone?: string; address?: string }
	phoneBrand?: { name?: string }
	model_name: string
	imei?: string
	fault_description: string
	device_condition?: string
	worker?: { name?: string }
	status: string
	warranty_days?: number
	warranty_expires_at?: string
	repair_duration_minutes?: number
	created_at: string
}

/**
 * Export service tickets list to formatted Excel (.xlsx) file
 */
export function exportTicketsToExcel(tickets: ExportTicketItem[], filenamePrefix = "riwayat_tiket_servis") {
	const data = tickets.map((t, index) => {
		return {
			"No.": index + 1,
			"No. Tiket": t.ticket_number || "-",
			"Nama Pelanggan": t.customer?.name || "-",
			"No. WhatsApp": t.customer?.phone || "-",
			"Alamat Pelanggan": t.customer?.address || "-",
			"Merek HP": t.phoneBrand?.name || "-",
			"Model HP": t.model_name || "-",
			"IMEI": t.imei || "-",
			"Kerusakan / Keluhan": t.fault_description || "-",
			"Kondisi Fisik": t.device_condition || "-",
			"Teknisi": t.worker?.name || "Belum Ditugaskan",
			"Status": t.status || "-",
			"Durasi Pengerjaan (Menit)": t.repair_duration_minutes != null ? t.repair_duration_minutes : "-",
			"Garansi (Hari)": t.warranty_days ?? 0,
			"Garansi Berakhir": t.warranty_expires_at ? dayjs(t.warranty_expires_at).format("YYYY-MM-DD") : "-",
			"Tanggal Masuk": t.created_at ? dayjs(t.created_at).format("YYYY-MM-DD HH:mm") : "-"
		}
	})

	const worksheet = XLSX.utils.json_to_sheet(data)

	// Set column widths
	const colWidths = [
		{ wch: 6 },  // No.
		{ wch: 22 }, // No. Tiket
		{ wch: 20 }, // Nama Pelanggan
		{ wch: 16 }, // No. WhatsApp
		{ wch: 25 }, // Alamat
		{ wch: 14 }, // Merek HP
		{ wch: 20 }, // Model HP
		{ wch: 18 }, // IMEI
		{ wch: 30 }, // Kerusakan
		{ wch: 25 }, // Kondisi Fisik
		{ wch: 18 }, // Teknisi
		{ wch: 18 }, // Status
		{ wch: 24 }, // Durasi
		{ wch: 14 }, // Garansi
		{ wch: 18 }, // Garansi Berakhir
		{ wch: 20 }  // Tanggal Masuk
	]
	worksheet["!cols"] = colWidths

	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, "Tiket Servis")

	const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
	const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" })

	const dateStr = dayjs().format("YYYYMMDD_HHmmss")
	saveAs(blob, `${filenamePrefix}_${dateStr}.xlsx`)
}
