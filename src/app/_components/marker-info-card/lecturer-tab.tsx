"use client";

import { User, BookOpen, Clock } from "lucide-react";
import { useLecturerListQuery } from "@/hooks/api/digital-twin/use-lecturer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";
import { motion } from "framer-motion";

interface LecturerTabProps {
  roomId: string;
}

export function LecturerTab({ roomId }: LecturerTabProps) {
  const { data: lecturers, isLoading } = useLecturerListQuery(roomId);

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <div className="flex items-center mb-4 flex-none gap-2">
        <User className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-semibold text-white/90">
          Lecturer Status
        </span>
      </div>

      <div className="flex-1 overflow-y-auto -mx-5 px-5 custom-scrollbar">
        <div className="flex flex-col gap-3 pb-5">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl bg-white/10" />
            ))
          ) : lecturers && lecturers.length > 0 ? (
            lecturers.map((lecturer, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                key={lecturer.id}
                className="glass-card rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group"
              >
                {/* Accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-white/10 shadow-lg group-hover:border-cyan-500/40 transition-colors">
                    <AvatarFallback className="bg-cyan-500/15 text-cyan-400 font-bold shadow-[inset_0_0_8px_rgba(6,182,212,0.1)]">
                      {lecturer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex flex-col min-w-0 pt-0.5">
                    <span className="text-sm font-bold text-white/90 truncate">
                      {lecturer.name}
                    </span>
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-white/60">
                        <BookOpen className="w-3 h-3 text-white/40" />
                        <span className="truncate">{lecturer.course || "No Active Course"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white/60">
                        <Clock className="w-3 h-3 text-white/40" />
                        <span>{lecturer.present_since || "Not Present"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-none">
                    <StatusBadge status={lecturer.status} />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center opacity-50">
              <User className="h-10 w-10 text-white/20 mb-4" />
              <p className="text-[11px] font-medium text-white/50">
                No lecturer data available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
