"use client";

import { useState } from "react";
import { User, ChevronDown } from "lucide-react";
import { useLecturerListQuery } from "@/hooks/api/digital-twin/use-lecturer";
import { LecturerResponse } from "@/types/response/digital-twin/lecturer-response";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import SearchInput from "@/components/common/input/search-input";
import { StatusBadge } from "./status-badge";
import { motion, AnimatePresence } from "framer-motion";
import { formatPresentSince, cn } from "@/lib/utils";

interface LecturerTabProps {
  roomId: string;
}

export function LecturerTab({ roomId }: LecturerTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: lecturers, isLoading } = useLecturerListQuery(
    roomId,
    searchQuery,
  );

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <div className="flex flex-col gap-3 mb-4 flex-none">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white/90">
            Lecturer Status
          </span>
        </div>
        <SearchInput
          placeholder="Search lecturer..."
          onSearch={setSearchQuery}
          className="w-full"
        />
      </div>

      <div className="flex-1 overflow-y-auto -mx-5 px-5 custom-scrollbar min-h-0">
        <div className="flex flex-col gap-3 pb-5">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-28 w-full rounded-xl bg-white/10"
              />
            ))
          ) : lecturers && lecturers.length > 0 ? (
            lecturers.map((lecturer, i) => (
              <LecturerCard key={lecturer.id} lecturer={lecturer} index={i} />
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

function LecturerCard({
  lecturer,
  index,
}: {
  lecturer: LecturerResponse;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="glass-card rounded-xl p-4 flex flex-col relative overflow-hidden group cursor-pointer hover:bg-white/[0.02] transition-colors"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 border-2 border-white/10 shadow-lg group-hover:border-cyan-500/40 transition-colors">
          <AvatarImage
            src={lecturer.profile_picture || undefined}
            alt={lecturer.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-cyan-500/15 text-cyan-400 font-bold shadow-[inset_0_0_8px_rgba(6,182,212,0.1)]">
            {lecturer.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex flex-col min-w-0 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white/90 truncate flex-1">
              {lecturer.name}
            </span>
            <div className="flex-none">
              <StatusBadge status={lecturer.status} />
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-white/40 transition-transform duration-300 ml-1 flex-none",
                isExpanded && "rotate-180",
              )}
            />
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <span className="truncate">
                {lecturer.course || "No Active Course"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <span>{formatPresentSince(lecturer.present_since)}</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span>
                  <span className="text-white/40">NIP:</span>{" "}
                  {lecturer.nip || "-"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <div className="flex items-center gap-1">
                  <span className="text-white/40">Phone:</span>
                  {lecturer.phone_number ? (
                    <a
                      href={`https://wa.me/${lecturer.phone_number.replace(/\D/g, "").replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyan-400 hover:underline transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lecturer.phone_number}
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
