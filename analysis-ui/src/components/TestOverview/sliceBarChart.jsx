import React from 'react';
import { Bar, BarCanvas } from '@nivo/bar';

// TODO: MCS-1598: sort and color stuff
// also add annotations for SEM +/-
const MyGroupedBar = ({ data, keys, leftLegendTitle} ) => {
    return <Bar
        data={data} 
        keys={keys}
        groupMode="grouped"
        maxValue={1.0}
        height={500}
        width={800}
        indexBy={"performer"}
        margin={{ top: 100, right: 110, bottom: 60, left: 80 }}
        padding={0.2}
        innerPadding={5}
        labelTextColor={'inherit:darker(1.4)'}
        labelSkipWidth={16}
        labelSkipHeight={16}    
        labelFormat={d => <tspan></tspan>}
        axisLeft={{
            tickRotation: 0,
            legend: leftLegendTitle,
            legendOffset: -45,
            legendPosition: 'middle'
        }}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Performer',
            legendOffset: 35,
            legendPosition: 'middle'
        }}
        legends={[
            {
                dataFrom: 'keys',
                anchor: 'top',
                direction: 'column',
                justify: false,
                translateX: 0,
                translateY: -60,
                itemsSpacing: 2,
                itemWidth: 180,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
            }
        ]}
    />;
};

class SlicesChart extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            style: {fontFamily: "Lato", textAlign: "center"}
        }

    }

    render() {

        return (
            <div style={this.state.styles}>
                    <MyGroupedBar data={this.props.data} keys={this.props.keys} leftLegendTitle={this.props.leftLegendTitle}/>
            </div>
        );
    }
}

export default SlicesChart;