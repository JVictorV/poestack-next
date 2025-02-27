import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import _ from "lodash";
import moment from "moment";
import "moment-timezone";
import React from "react";
import { useState } from "react";

import { gql, useQuery } from "@apollo/client";
import StyledLoading from "@components/library/styled-loading";
import { GenericAggregation } from "@generated/graphql";

export default function LeagueTradeActivity() {
  const [leagueActivityResp, setLeagueActivityResp] =
    useState<GenericAggregation | null>(null);
  useQuery(
    gql`
      query LeagueActvityTimeseries {
        leagueActvityTimeseries {
          values {
            timestamp
            key
            value
          }
        }
      }
    `,
    {
      onCompleted(data) {
        setLeagueActivityResp(data.leagueActvityTimeseries);
      },
    }
  );

  if (!leagueActivityResp) {
    return (
      <>
        <StyledLoading />
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <Meta2TimeseriesChart values={leagueActivityResp?.values ?? []} />
      </div>
    </>
  );
}

export function Meta2TimeseriesChart({
  values,
}: {
  values: {
    key?: string | undefined | null;
    value?: number | undefined | null;
    timestamp?: string | undefined | null;
  }[];
}) {
  const grouped = _.groupBy(values, "key");

  const series = Object.values(grouped)
    .map((v) => {
      const data = v?.map((s) => {
        return [new Date(s?.timestamp ?? 0).valueOf(), s.value];
      });
      data.sort((a, b) => (a[0]?.valueOf() ?? 0) - (b[0]?.valueOf() ?? 0));

      return {
        name: v[0]?.key,
        tooltip: {
          valueDecimals: 0,
        },
        marker: {
          enabled: false,
        },
        minPopulation: v.some((e) => (e.value ?? 0) >= 10),
        lastV: v[v.length - 1]?.value,
        data: data,
      };
    })
    .filter((e) => e.minPopulation);

  series.sort((a, b) => (b.lastV ?? 0) - (a.lastV ?? 0));

  const options = {
    chart: {
      type: "spline",
    },
    title: {
      text: "",
    },
    time: {
      moment: moment,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    yAxis: {
      title: {
        enabled: false,
      },
      stackLabels: {
        enabled: true,
      },
    },
    xAxis: {
      type: "datetime",
      dateTimeLabelFormats: {
        minute: "%l:%M %P",
        hour: "%l:%M %P",
        day: "%e. %b",
        week: "%e. %b",
        month: "%b '%y",
        year: "%Y",
      },
    },

    legend: {
      enabled: true,
      itemStyle: {
        color: "white",
      },
    },
    series: series.filter((e) => !!e?.name),
  };

  return (
    <>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </>
  );
}
