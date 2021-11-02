import React, {useState} from 'react';
import {ResponsiveLine} from '@nivo/line';
import _ from 'lodash';
import $ from 'jquery';

const MyResponsiveLine = ({ data, xAxisMax, xTicks }) => (
    <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 100, bottom: 50, left: 80 }}
        xScale={{ type: 'linear', min: 1, max: xAxisMax + 1}}
        yScale={{ type: 'linear', min: 0, max: 1.1}}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Frame',
            legendOffset: 35,
            legendPosition: 'middle',
            tickValues: xTicks
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Plausibility',
            legendOffset: -40,
            legendPosition: 'middle',
            tickValues: [0, 0.2, 0.4, 0.6, 0.8, 1.0]
        }}
        colors={{ scheme: 'dark2' }}
        enablePoints={false}
        pointSize={5}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor', modifiers: [] }}
        pointLabel="y"
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
            {
                anchor: 'top-right',
                direction: 'column',
                justify: false,
                reverse: true,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}

    />
)

function PlausabilityGraph ({pointsData, xAxisMax}) {

    const calculateXTicks = () => {
        if(xAxisMax === 60) {
            return [20, 40, 60];
        } else {
            let xAxisTickMultiplier = Math.round(xAxisMax / 3);

            return [xAxisTickMultiplier, xAxisTickMultiplier * 2, xAxisMax]
        }
    }

    return (
        <div style={{ height: '350px', width: '400px' }}>
            <MyResponsiveLine data={pointsData} xAxisMax={xAxisMax} xTicks={calculateXTicks()}/>
        </div>
    )
}

export default PlausabilityGraph;