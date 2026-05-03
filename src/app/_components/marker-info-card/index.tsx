"use client";

import { cn } from "@/lib/utils";
import { X, User, Monitor, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoomShowQuery } from "@/hooks/api/digital-twin/use-room";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LecturerTab } from "./lecturer-tab";
import { DeviceTab } from "./device-tab";
import { ScheduleTab } from "./schedule-tab";

interface MarkerInfoCardProps {
  id: string;
  title: string;
  onClose: () => void;
  className?: string;
}

function MarkerInfoCardInternal({
  id,
  title,
  onClose,
  className,
}: MarkerInfoCardProps) {
  const { data: room, isLoading: isLoadingRoom } = useRoomShowQuery(id);

  return (
    <Card
      className={cn(
        "w-[420px] max-h-[85vh] shadow-2xl border-border/50 bg-background/95 backdrop-blur-md animate-in fade-in zoom-in duration-75 flex flex-col overflow-hidden",
        className,
      )}
    >
      <CardHeader className="p-5 pb-3 flex flex-none flex-row items-start justify-between space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-xl font-bold text-foreground tracking-tight">
            {isLoadingRoom ? (
              <Skeleton className="h-7 w-40" />
            ) : (
              room?.name || title
            )}
          </CardTitle>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            {isLoadingRoom ? (
              <Skeleton className="h-4 w-56" />
            ) : (
              <>
                <div className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md">
                  <span className="text-foreground">
                    {room?.floor || "Lantai -"}
                  </span>
                </div>
                <span className="text-muted-foreground/30">•</span>
                <div className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md">
                  <span className="text-foreground">
                    {room?.building || "Gedung -"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-muted -mt-1 -mr-1"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <Tabs
          defaultValue="lecturer"
          className="w-full flex-1 flex flex-col min-h-0"
        >
          <TabsList className="w-full justify-start h-12 bg-transparent border-b border-border/50 rounded-none px-5 gap-6 flex-none">
            <TabsTrigger
              value="lecturer"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 gap-2 text-xs font-semibold transition-none"
            >
              <User className="h-4 w-4" />
              Lecturer
            </TabsTrigger>
            <TabsTrigger
              value="device"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 gap-2 text-xs font-semibold transition-none"
            >
              <Monitor className="h-4 w-4" />
              Device
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1 gap-2 text-xs font-semibold transition-none"
            >
              <Calendar className="h-4 w-4" />
              Jadwal
            </TabsTrigger>
          </TabsList>

            <TabsContent
              value="lecturer"
              className="mt-0 p-5 outline-none"
            >
              <LecturerTab roomId={id} />
            </TabsContent>

            <TabsContent
              value="device"
              className="mt-0 p-5 outline-none"
            >
              <DeviceTab />
            </TabsContent>

            <TabsContent
              value="schedule"
              className="mt-0 p-5 outline-none"
            >
              <ScheduleTab roomId={id} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function MarkerInfoCard(props: MarkerInfoCardProps) {
  const queryClient = useQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <MarkerInfoCardInternal {...props} />
    </QueryClientProvider>
  );
}
