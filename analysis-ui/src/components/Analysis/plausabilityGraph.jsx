import React from 'react';
import {ResponsiveLine} from '@nivo/line';
import _ from 'lodash';
import $ from 'jquery';

const MyResponsiveLine = ({ data }) => (
    <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 175, bottom: 30, left: 80 }}
        xScale={{ type: 'linear', min: 1, max: 61}}
        yScale={{ type: 'linear', min: 0, max: 1.1}}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Frame',
            legendOffset: 36,
            legendPosition: 'middle',
            tickValues: [10, 20, 30, 40, 50, 60]
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

class PlausabilityGraph extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{ height: '300px', width: '100%' }}>
                <MyResponsiveLine data={this.props.pointsData} />
            </div>       
        )
    }
}

export default PlausabilityGraph;