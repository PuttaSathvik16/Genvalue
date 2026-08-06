"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaAward, FaDownload, FaLinkedin, FaGraduationCap } from "react-icons/fa6";
import { getAuthTokenWithRefresh } from "@/services/authService";
import { CardGridSkeleton, PortalTitleSkeleton } from "@/components/skeletons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Certificate {
  id: string;
  certificateId: string;
  courseTitle: string;
  courseId: string;
  userName: string;
  issuedAt: string;
  pdfUrl?: string;
  qrCodeUrl?: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const authToken = await getAuthTokenWithRefresh();

        if (!authToken) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/user/certificates`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCertificates(data.data || []);
        } else {
          setError("Failed to load certificates");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load certificates");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PortalTitleSkeleton />
        <CardGridSkeleton count={2} cols={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
            ★ VERIFIED CREDENTIALS
          </span>
          <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            My Certificates & Badges
          </h1>
          <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
            Shareable, tamper-proof credentials backed by unique QR verification IDs.
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-black/20 bg-[#F6F1E4]/50 p-12 text-center dark:border-white/20 dark:bg-[#0D1B2A]/50">
          <FaGraduationCap className="h-16 w-16 text-[#1E3FE0]/30 dark:text-[#60A5FA]/30" />
          <div>
            <h2 className="font-display-custom text-2xl font-bold text-[#2A2A28] dark:text-white">
              No Certificates Yet
            </h2>
            <p className="mt-2 text-sm text-[#6B6558] dark:text-slate-400">
              Complete a course to earn your certificate!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {certificates.map((cert) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col justify-between rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8"
            >
              <div>
                <div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <FaAward className="h-6 w-6 text-amber-500" />
                    <span className="font-display-custom text-base font-extrabold text-[#2A2A28] dark:text-white">
                      GenValue
                    </span>
                  </div>
                  <span className="rounded-full bg-[#10B981]/10 px-3 py-1 text-[10px] font-extrabold uppercase text-[#10B981]">
                    VERIFIED CREDENTIAL
                  </span>
                </div>

                <div className="mt-6 text-center">
                  <span className="font-annotation text-xs font-bold text-[#E8622E]">CERTIFICATE OF COMPLETION</span>
                  <h2 className="font-display-custom mt-2 text-2xl font-extrabold text-[#2A2A28] dark:text-white">
                    {cert.courseTitle}
                  </h2>
                  <p className="mt-2 text-xs font-medium text-[#6B6558] dark:text-slate-300">
                    Awarded to <strong className="font-bold text-[#1E3FE0] dark:text-[#60A5FA]">{cert.userName}</strong> for successfully completing all 12 modules, quizzes, and the multi-tool capstone project.
                  </p>
                </div>

                {/* QR Verification Bar */}
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">Unique Verification ID</p>
                    <p className="font-mono text-xs font-extrabold text-[#2A2A28] dark:text-white">{cert.certificateId}</p>
                    <p className="mt-0.5 text-[10px] text-[#6B6558] dark:text-slate-400">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                  </div>

                  {cert.qrCodeUrl && (
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                      <Image src={cert.qrCodeUrl} alt="QR Code" fill className="object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-3 border-t border-black/10 pt-4 dark:border-white/10">
                <a
                  href={cert.pdfUrl || `${API_URL}/certificates/${cert.certificateId}/pdf`}
                  download
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1E3FE0] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#1630aa] dark:bg-[#60A5FA] dark:text-[#070B19]"
                >
                  <FaDownload className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/verify/certificate/${cert.certificateId}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert("Certificate link copied to clipboard!");
                  }}
                  className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-bold text-[#2A2A28] shadow-md dark:border-white/10 dark:bg-white/10 dark:text-white"
                >
                  <FaLinkedin className="h-4 w-4 text-[#0A66C2]" />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
