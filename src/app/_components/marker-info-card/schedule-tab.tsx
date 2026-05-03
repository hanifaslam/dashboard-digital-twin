"use client";

import { Calendar } from "lucide-react";
import { useScheduleListQuery } from "@/hooks/api/digital-twin/use-schedule";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ScheduleTabProps {
  roomId: string;
}

export function ScheduleTab({ roomId }: ScheduleTabProps) {
  const { data: schedules, isLoading } = useScheduleListQuery(roomId);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center mb-3 flex-none">
        <span className="text-sm font-semibold text-foreground">
          Schedule in Room
        </span>
      </div>

      <ScrollArea className="h-[30vh] w-full">
        <div className="flex flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))
          ) : schedules && schedules.length > 0 ? (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center gap-2 p-2 rounded-md border w-full bg-background"
              >
                <div className="flex flex-col items-center justify-center h-12 rounded-md bg-muted p-2">
                  <span className="text-[10px] text-foreground">
                    {schedule.start_time} - {schedule.end_time}
                  </span>
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {schedule.course_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {schedule.lecturer_name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/40 mb-4" />
              <p className="text-xs text-muted-foreground">
                No schedule in this room
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
