"use client";

import { Calendar } from "lucide-react";
import { useScheduleListQuery } from "@/hooks/api/digital-twin/use-schedule";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface ScheduleTabProps {
  roomId: string;
}

export function ScheduleTab({ roomId }: ScheduleTabProps) {
  const { data: schedules, isLoading } = useScheduleListQuery(roomId);

  return (
    <div className="relative w-full flex h-full flex-col overflow-hidden">
      <div className="absolute inset-0 rounded-xl bg-slate-950" />

      <div className="relative z-10 flex items-center mb-4 flex-none gap-2">
        <Calendar className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-semibold text-white/90">
          Room Schedule
        </span>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto -mx-5 bg-slate-950 px-5 custom-scrollbar">
        <div className="flex flex-col gap-3 pb-5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 w-full rounded-xl bg-white/10"
              />
            ))
          ) : schedules && schedules.length > 0 ? (
            schedules.map((schedule, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                key={schedule.id}
                className="relative flex items-center"
              >
                {/* Glass Card */}
                <div className="w-full rounded-xl border border-cyan-500/10 bg-slate-900 p-3 flex items-start gap-4 transition-transform duration-300 hover:-translate-y-0.5">
                  {/* Time Badge */}
                  <div className="flex flex-col items-center justify-center min-w-[100px] h-[52px] rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/5 blur-md" />
                    <span className="text-xs z-10 text-white">
                      {schedule.start_time} - {schedule.end_time}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-sm font-bold text-white/90 truncate mb-1">
                      {schedule.course_name}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-white/60">
                      <span className="truncate">{schedule.lecturer_name}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center opacity-50 z-10 bg-background/50 backdrop-blur-sm rounded-xl">
              <Calendar className="h-10 w-10 text-white/20 mb-4" />
              <p className="text-[11px] font-medium text-white/50">
                No schedule for today
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
