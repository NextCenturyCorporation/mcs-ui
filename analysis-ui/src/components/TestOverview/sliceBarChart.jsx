import React from 'react';
import { BarChart, Bar, Cell, ErrorBar, XAxis, YAxis, CartesianGrid, Tooltip, Label, Legend, ResponsiveContainer } from 'recharts';
import _ from "lodash";

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <span>{`Slice: ${payload[0].payload.slice}`}</span><br/>
          <span>{`Mean: ${payload[0].value}`}</span><br/>
          <span>{`SEM: +/-${payload[0].payload.errorY[0]}`}</span><br/>
        </div>
      );
    }
    return null;
};

class SlicesChart extends React.Component {

    constructor(props) {
        super(props);
    }
  
    render() {
        return (
            <>
                { this.props.data.length > 0 && 
                    <div className="slices-chart-container">
                        <BarChart
                        width={500}
                        name="Mean"
                        height={400}
                        data={this.props.data}
                        margin={{
                            top: 30,
                            right: 30,
                            left: 50,
                            bottom: 5,
                        }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis tick={false}>
                                <Label value={this.props.performer}></Label>
                            </XAxis>
                            <YAxis tickCount={11} interval="preserveStartEnd" type="number" domain={[0, 1.0]}>
                                <Label value="Mean" position="left" offset={10}/>
                            </YAxis>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Bar dataKey="value">
                                <ErrorBar dataKey="errorY" width={4} strokeWidth={2} stroke="black" direction="y" />
                                {
                                    this.props.data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} id={entry.slice} fill={entry.color} />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                        <div className="slices-chart-legend-container">
                            <div className="slices-chart-legend">
                                {
                                this.props.data.map((entry, index) => (
                                    <div key={`item-${index}`}>
                                        <div style={{display:'inline-block',width:'12px',height:'12px',backgroundColor:entry.color,margin: '0 5px'}}></div>{entry.slice}
                                    </div>
                                ))
                                }
                            </div>
                        </div>
                    </div>
                }
            </>

        );
    }
}

export default SlicesChart;