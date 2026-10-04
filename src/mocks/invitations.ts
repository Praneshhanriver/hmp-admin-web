import type { Invitation } from "@/types/invitation";

// 18 mock invitations, matching the Hi-Fi list ("18 invitations").
// Rows 1–8 are the spec rows from p.113c. Replaced by the real API in Homework 2.
export const MOCK_INVITATIONS: Invitation[] = [
  { id: "inv-1001", doctorName: "Dr. Kim Han-mi", email: "kim.hanmi@clinic.co.kr", mobile: "010-1234-5678", status: "pending", issuedAt: "2026-09-08T10:00:00+09:00", expiresAt: "2026-09-22T10:00:00+09:00", reissueCount: 0 },
  { id: "inv-1002", doctorName: "Dr. Lee Seo-jun", email: "lee.seojun@clinic.co.kr", mobile: "010-2345-1234", status: "used", issuedAt: "2026-09-05T10:00:00+09:00", expiresAt: "2026-09-19T10:00:00+09:00", reissueCount: 0 },
  { id: "inv-1003", doctorName: "Dr. Park Ji-ho", email: "park.jiho@clinic.co.kr", mobile: "010-3456-8765", status: "expired", issuedAt: "2026-08-20T10:00:00+09:00", expiresAt: "2026-09-03T10:00:00+09:00", reissueCount: 1 },
  { id: "inv-1004", doctorName: "Dr. Choi Yun-a", email: "choi.yuna@clinic.co.kr", mobile: "010-4567-2468", status: "revoked", issuedAt: "2026-09-01T10:00:00+09:00", expiresAt: "2026-09-15T10:00:00+09:00", reissueCount: 0 },
  { id: "inv-1005", doctorName: "Dr. Jung Min-seok", email: "jung.minseok@clinic.co.kr", mobile: "010-5678-1357", status: "pending", issuedAt: "2026-09-09T10:00:00+09:00", expiresAt: "2026-09-23T10:00:00+09:00", reissueCount: 2 },
  { id: "inv-1006", doctorName: "Dr. Han Do-kyung", email: "han.dokyung@clinic.co.kr", mobile: "010-6789-9753", status: "expired", issuedAt: "2026-08-28T10:00:00+09:00", expiresAt: "2026-09-11T10:00:00+09:00", reissueCount: 0 },
  { id: "inv-1007", doctorName: "Dr. Oh Se-ra", email: "oh.sera@clinic.co.kr", mobile: "010-7890-4680", status: "used", issuedAt: "2026-09-02T10:00:00+09:00", expiresAt: "2026-09-16T10:00:00+09:00", reissueCount: 1 },
  { id: "inv-1008", doctorName: null, email: null, mobile: null, status: "revoked", issuedAt: "2026-08-15T10:00:00+09:00", expiresAt: "2026-08-29T10:00:00+09:00", reissueCount: 3 },
  { id: "inv-1009", doctorName: "Dr. Seo Ha-eun", email: "seo.haeun@clinic.co.kr", mobile: "010-1111-4321", status: "pending", issuedAt: "2026-09-10T10:00:00+09:00", expiresAt: "2026-09-24T10:00:00+09:00", reissueCount: 0 },
  { id: "inv-1010", doctorName: "Dr. Kang Bo-ra", email: "kang.bora@clinic.co.kr", mobile: "010-2222-3344", status: "used", issuedAt: "2026-08-25T10:00:00+09:00", expiresAt: "2026-09-08T10:00:00+09:00", reissueCount: 0 },
  { id: "inv-1011", doctorName: "Dr. Yoon Tae-ho", email: "yoon.taeho@clinic.co.kr", mobile: "010-3333-5566", status: "pending", issuedAt: "2026-09-11T10:00:00+09:00", expiresAt: "2026-09-25T10:00:00+09:00", reissueCount: 1 },
  { id: "inv-1012", doctorName: "Dr. Lim Ji-won", email: "lim.jiwon@clinic.co.kr", mobile: "010-4444-7788", status: "expired", issuedAt: "2026-08-10T10:00:00+09:00", expiresAt: "2026-08-24T10:00:00+09:00", reissueCount: 2 },
  { id: "inv-1013", doctorName: "Dr. Shin Eun-ji", email: "shin.eunji@clinic.co.kr", mobile: "010-5555-9900", status: "used", issuedAt: "2026-08-30T10:00:00+09:00", expiresAt: "2026-09-13T10:00:00+09:00", reissueCount: 0 },
  { id: "inv-1014", doctorName: "Dr. Hwang Min-ho", email: "hwang.minho@clinic.co.kr", mobile: "010-6666-1122", status: "revoked", issuedAt: "2026-09-03T10:00:00+09:00", expiresAt: "2026-09-17T10:00:00+09:00", reissueCount: 1 },
  { id: "inv-1015", doctorName: "Dr. Song Ye-jin", email: "song.yejin@clinic.co.kr", mobile: "010-7777-3344", status: "pending", issuedAt: "2026-09-12T10:00:00+09:00", expiresAt: "2026-09-26T10:00:00+09:00", reissueCount: 0 },
  { id: "inv-1016", doctorName: "Dr. Jang Woo-sung", email: "jang.woosung@clinic.co.kr", mobile: "010-8888-5566", status: "used", issuedAt: "2026-08-22T10:00:00+09:00", expiresAt: "2026-09-05T10:00:00+09:00", reissueCount: 0 },
  { id: "inv-1017", doctorName: "Dr. Bae Su-ji", email: "bae.suji@clinic.co.kr", mobile: "010-9999-7788", status: "expired", issuedAt: "2026-08-05T10:00:00+09:00", expiresAt: "2026-08-19T10:00:00+09:00", reissueCount: 0 },
  { id: "inv-1018", doctorName: "Dr. Moon Hye-rin", email: "moon.hyerin@clinic.co.kr", mobile: "010-1212-9090", status: "pending", issuedAt: "2026-09-13T10:00:00+09:00", expiresAt: "2026-09-27T10:00:00+09:00", reissueCount: 0 },
];
