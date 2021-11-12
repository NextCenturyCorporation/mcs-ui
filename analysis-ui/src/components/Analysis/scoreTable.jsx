import React, {useState} from 'react';
import _ from "lodash";
import { convertValueToString } from './displayTextUtils';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import SceneDetails from './sceneDetails';

function ScoreTable({columns, currentPerformerScenes, currentSceneNum, 
    changeSceneHandler, scenesInOrder, constantsObject, sortable}) {

    const [sortOption, setSortOption] = useState({sortBy: "", sortOrder: "asc"})

    const getSorting = (order, orderBy) => {
        return order === "desc"
        ? (a, b) => (_.get(a, orderBy) > _.get(b, orderBy) ? -1 : 1)
        : (a, b) => (_.get(a, orderBy) < _.get(b, orderBy) ? -1 : 1);
    }

    const displayItemText = (row, dataKey) => {
        let item = _.get(row, dataKey);

        if(item !== undefined && item !== null && item !== "") {
            return convertValueToString(item);
        } else {
            return "";
        }
    }

    const handleRequestSort = (property) => {
        let isAsc = sortOption.sortBy === property && sortOption.sortOrder === 'asc';

        setSortOption({sortOrder: isAsc ? 'desc' : 'asc', sortBy: property})
    };

    const getCurrentScene = (scenesInOrder) => {
        return scenesInOrder[currentSceneNum - 1];
    }

    return (
        <div className="score-table-div">
            <Table className="score-table" aria-label="simple table">
                <TableHead>
                    <TableRow>
                    {columns.map((col, colKey) => (
                        <TableCell key={"performer_score_header_cell_" + colKey}>
                            {sortable &&
                                <TableSortLabel active={sortOption.sortBy === col.dataKey} direction={sortOption.sortOrder} 
                                    onClick={() => handleRequestSort(col.dataKey)}>
                                    {col.title}
                                </TableSortLabel>
                            }
                            {!sortable &&
                                col.title
                            }
                        </TableCell>
                    ))}
                        <TableCell key="performer_score_header_cell_details">
                            Details
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {currentPerformerScenes !== undefined && _.values(currentPerformerScenes).sort(getSorting(sortOption.sortOrder, sortOption.sortBy)).map((scoreObj, rowKey) => 
                    <TableRow classes={{ root: 'TableRow'}} className="pointer-on-hover" key={'performer_score_row_' + rowKey} hover selected={currentSceneNum === scoreObj.scene_num} onClick={()=> changeSceneHandler(scoreObj.scene_num)}> 
                        {columns.map((col, colKey) => (
                            <TableCell key={"performer_score_row_" + rowKey + "_col_" + colKey}>
                                {col.title === 'Evaluation Score' &&
                                    <div className="score-div">
                                        {displayItemText(scoreObj, col.dataKey) === 'Correct' &&
                                            <i className='material-icons' style={{color: "#008000", fontSize: '20px'}}>check</i>
                                        }
                                        {displayItemText(scoreObj, col.dataKey) === 'Incorrect' &&
                                            <i className='material-icons' style={{color: "#ff0000", fontSize: '20px'}}>close</i>
                                        }
                                        <span className='score-text'>{displayItemText(scoreObj, col.dataKey)}</span>
                                    </div>
                                }
                                {col.title !== 'Evaluation Score' &&
                                    displayItemText(scoreObj, col.dataKey)
                                }
                            </TableCell>
                        ))}
                        <TableCell key={"performer_score_row_" + rowKey + "_col_details"}>
                            <SceneDetails  
                                currentSceneNum={currentSceneNum}
                                currentScene={getCurrentScene(scenesInOrder)}
                                constantsObject={constantsObject}
                            />
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>                                                   
    );
}

export default ScoreTable;
