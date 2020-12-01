import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

const ValueOutside = ({ bars }) => {
    return bars.map((bar) => {
      const {
        key,
        width,
        height,
        x,
        y,
        data: { value }
      } = bar;
      return (
        <g key={key} transform={`translate(${x}, ${y})`}>
          <text
            transform={`translate(${width + 16}, ${height / 2 + 5})`}
            textAnchor="middle"
            fontSize="11px"
          >
            {value}
          </text>
        </g>
      );
    });
  };

const MyResponsiveBar = ({ data, keys, chartIndex, maxVal}) => {
    return <ResponsiveBar 
        data={data} 
        keys={keys} 
        indexBy={chartIndex}
        layout="horizontal"
        groupMode="grouped"
        valueScale={{ type: 'linear' }}
        maxValue={maxVal}
        margin={{ top: 50, right: 50, bottom: 50, left: 150 }} 
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Number of Tests',
            legendPosition: 'middle',
            legendOffset: 32
        }}
        enableGridY={false}
        enableGridX={true}
        colors={["#00A0D2", "#444D5D", "#D95555"]}
        labelFormat={d => <tspan></tspan>}
        legends={[
            {
                dataFrom: 'keys',
                anchor: 'top',
                direction: 'row',
                justify: false,
                translateX: 10,
                translateY: -20,
                itemsSpacing: 2,
                itemWidth: 180,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
            }
        ]}
        layers={[
            "grid",
            "axes",
            "bars",
            "markers",
            "legends",
            "annotations",
            (props) => <ValueOutside {...props} />
          ]}
    />;
};

class ResultsChart extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            style: {fontFamily: "Lato", textAlign: "center"}
        }
    }

    render() {
        return (
            <div style={this.state.styles} className="flex-chart-center">
                <div style={{ height: "450px", width: "900px" }}>
                    <MyResponsiveBar data={this.props.chartData} keys={this.props.chartKeys} chartIndex={this.props.chartIndex} maxVal={this.props.maxVal}/>
                </div>
          </div>
        );
    }
}

export default ResultsChart;