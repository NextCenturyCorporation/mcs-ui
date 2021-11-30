import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

const formatCategoryTypeString = function(catTypeString) {
    const words = catTypeString.split("_");

    return words.map((word) => { 
        return word[0].toUpperCase() + word.substring(1); 
    }).join(" ");
}

const formatBarTextLabel = function(value, bar, incorrectData, isPercent, data) {
  // If Percent do not calculate totals, already done
  if(isPercent){
    return value + "%";
  }

  // Value 0 = performer, 1 = test type
  const matchDataKey = bar.key.split(".");
  const matchingIncorrectObj = incorrectData.find(o => o.test_type === matchDataKey[1]);

  if(matchingIncorrectObj === undefined) {
    const novelPlausMatch = matchDataKey[1].split(" ");
    const matchingObj = data.find(o => o.test_type !== matchDataKey[1] && o.test_type.indexOf(novelPlausMatch[0] + " ") > -1);

    return value + " / " + (matchingObj[matchDataKey[0]] + value);
  } else {
    return value + " / " + (matchingIncorrectObj[matchDataKey[0]] + value);
  }
}

const ValueOutside = ({props}) => {
    return props.bars.map((bar) => {
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
            transform={`translate(${width + 36}, ${height / 2 + 5})`}
            textAnchor="middle"
            fontSize="11px"
          >
            {formatBarTextLabel(value, bar, props.incorrectData, props.isPercent, props.data)}
          </text>
        </g>
      );
    });
  };

const MyResponsiveBar = ({ data, keys, chartIndex, maxVal, legendLabel, isPercent, incorrectData}) => {
    return <ResponsiveBar 
        data={data} 
        keys={keys} 
        isPercent={isPercent}
        incorrectData={incorrectData}
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
            legend: legendLabel,
            legendPosition: 'middle',
            legendOffset: 36
        }}
        axisLeft={{ format: v => formatCategoryTypeString(v) }}
        enableGridY={false}
        enableGridX={true}
        colors={["#00A0D2", "#444D5D", "#D95555", "#8A55D9", "#999D5D"]}
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
            (props) => <ValueOutside props={props}/>
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
                    <MyResponsiveBar data={this.props.chartData} keys={this.props.chartKeys} chartIndex={this.props.chartIndex} maxVal={this.props.maxVal} 
                      legendLabel={this.props.legendLabel} isPercent={this.props.isPercent} incorrectData={this.props.incorrectData}/>
                </div>
          </div>
        );
    }
}

export default ResultsChart;