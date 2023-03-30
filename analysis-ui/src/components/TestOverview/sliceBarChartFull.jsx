import React from 'react';
import { Bar } from '@nivo/bar';

//colors={["#00A0D2", "#444D5D", "#D95555", "#8A55D9", "#999D5D"]}
const MyGroupedBar = ({ data, keys} ) => {
    return <Bar 
        data={data} 
        keys={keys}
        groupMode="grouped"
        maxValue={1.0}
        height={500}
        width={800}
        indexBy={"performer"}
        margin={{ top: 60, right: 110, bottom: 60, left: 80 }}
        padding={0.2}
        labelTextColor={'inherit:darker(1.4)'}
        labelSkipWidth={16}
        labelSkipHeight={16}    
        labelFormat={d => <tspan></tspan>}
        axisLeft={{
            tickRotation: 0,
            legend: 'Mean',
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
                anchor: 'top-right',
                direction: 'column',
                justify: false,
                translateX: 150,
                translateY: 0,
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


/* MCS-1598: TODO: and/or clause, chart colors? */
class SlicesFullChart extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            style: {fontFamily: "Lato", textAlign: "center"},
            /*fakeData: [
                {performer: "mess", "object moves off screen first object": 0.7223, "object moves off screen second object": 0.4550}, 
                {performer: "cora", "object moves off screen first object": 0.423, "object moves off screen second object": 0.4550}, 
            ],
            someKeys: ["object moves off screen first object", "object moves off screen second object"],*/
        }

    }


    render() {
        return (
            <div style={this.state.styles} className="flex-chart-left">
                <div>
                    <MyGroupedBar data={this.props.data} keys={this.props.keys}/>
                </div>
          </div>
        );
    }
}

export default SlicesFullChart;