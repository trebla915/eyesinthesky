"use client";

import React from "react";
import { Card } from "./ui/Card";
import { TwitterTimelineEmbed } from "react-twitter-embed";

export default function ElPasoTxGovFeed({ glowType = "" }) {
  return (
    <Card className="h-[500px] flex flex-col" glowType={glowType}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight">El Paso TX Gov</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <TwitterTimelineEmbed
          sourceType="profile"
          screenName="elpasotxgov"
          options={{ height: 400 }}
          noHeader
          noFooter
        />
      </div>
    </Card>
  );
}


