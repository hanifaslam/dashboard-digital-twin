"use client";

import { cn } from "@/lib/utils";
import { User, Monitor, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoomShowQuery } from "@/hooks/api/digital-twin/use-room";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LecturerTab } from "./lecturer-tab";
import { DeviceTab } from "./device-tab";
import { ScheduleTab } from "./schedule-tab";
import React from "react";

interface MarkerInfoCardProps {
  id: string;
  title: string;
  onClose: () => void;
  className?: string;
}

function MarkerInfoCardInternal({ id, title, className }: MarkerInfoCardProps) {
  const { data: room, isLoading: isLoadingRoom } = useRoomShowQuery(id);
  const [activeTab, setActiveTab] = React.useState("lecturer");

  return (
    <Card
      className={cn(
        "w-[420px] max-h-[85vh] shadow-md animate-in fade-in zoom-in duration-75 flex flex-col overflow-hidden",
        className,
      )}
    >
      <CardHeader className="flex flex-none flex-row items-start justify-between">
        <div className="flex flex-col">
          <CardTitle className="text-lg font-semibold">
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
                <div className="">
                  <span className="text-foreground">
                    {room?.floor || "Lantai -"}
                  </span>
                </div>
                <span>-</span>
                <div className="flex items-center">
                  <span className="text-foreground">
                    {room?.building || "Gedung -"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <Tabs
          defaultValue="lecturer"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 flex flex-col min-h-0"
        >
          <TabsList className="w-full justify-start h-12 bg-transparent border-b border-border/50 rounded-none px-5 gap-6">
            <TabsTrigger
              value="lecturer"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent rounded-none h-full px-1 gap-2 text-xs font-semibold transition-none"
            >
              <User className="h-4 w-4" />
              Lecturer
            </TabsTrigger>
            <TabsTrigger
              value="device"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent rounded-none h-full px-1 gap-2 text-xs font-semibold transition-none"
            >
              <Monitor className="h-4 w-4" />
              Device
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent rounded-none h-full px-1 gap-2 text-xs font-semibold transition-none"
            >
              <Calendar className="h-4 w-4" />
              Jadwal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lecturer" className="mt-0 px-5 py-2 outline-none">
            {activeTab === "lecturer" && <LecturerTab roomId={id} />}
          </TabsContent>

          <TabsContent value="device" className="mt-0 px-5 py-2 outline-none">
            <DeviceTab />
          </TabsContent>

          <TabsContent value="schedule" className="mt-0 px-5 py-2 outline-none">
            {activeTab === "schedule" && <ScheduleTab roomId={id} />}
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
