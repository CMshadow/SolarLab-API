const MathLineCollection = require('../math/mathLineCollection.js');
const MathLine = require('../math/mathLine.js');
const MyMath = require('../math/polygonMath.js');
const BasicMath = require('../math/math');
const Coordinate = require('../point/coordinate');
const Point = require('../point/point');
const Polyline = require('../line/polyline');

const sortByCorLonAsc = (obj1, obj2) => {
  return (obj1.cor.lon - obj2.cor.lon);
};

const sortByCorLonDes = (obj1, obj2) => {
  return (obj2.cor.lon - obj1.cor.lon);
};

const sortByCorLatAsc = (obj1, obj2) => {
  return (obj1.cor.lat - obj2.cor.lat);
};

const sortByCorLatDes = (obj1, obj2) => {
  return (obj2.cor.lat - obj1.cor.lat);
};

const sortByDist = (obj1, obj2) => {
  return (obj1.dist - obj2.dist);
};

const calculatePitchedRoofPanel = (
  RoofFoundLine, allKeepoutFoundLine, align, rotationAngle, panelWidth,
  panelLength, height, widthOffset, lengthOffset, panelTiltAngle,
  initArraySequenceNum, rowPerArray, panelsPerRow, obliquity, pitchedRoofPolygon
) => {
  // 计算夹角
  let angleDiff = 1;
  if (rotationAngle <= 180 && rotationAngle > 90) {
    angleDiff = 180 - rotationAngle;
  } else if (rotationAngle > 0 && rotationAngle < 90) {
    angleDiff = 90 - rotationAngle;
  } else if (rotationAngle > 180 && rotationAngle < 270) {
    angleDiff = 270 - rotationAngle;
  } else if (rotationAngle > 270 && rotationAngle < 360) {
    angleDiff = 360 - rotationAngle;
  }

  // 朝向转换为 正北0度 正南180度 正东90度 正西270度 区间为-180到180度之间
  rotationAngle = -(rotationAngle + 180);
  if (rotationAngle > 180) {
    rotationAngle = rotationAngle - 360;
  } else if (rotationAngle < -180) {
    rotationAngle = rotationAngle + 360;
  }

  // 屋顶顶点sequence转换为顶点、朝向、边距离sequence
  const rooftopLineCollection = MathLineCollection.fromPolyline(RoofFoundLine);
  // 障碍物顶点sequence转换为顶点、朝向、边距离sequence
  const allKeepoutLineCollection = [];
  allKeepoutFoundLine.forEach(kpt =>
    allKeepoutLineCollection.push(MathLineCollection.fromPolyline(kpt))
  );

  // bounding box west, east, north, south
  const boundingWENS = MyMath.generateBoundingWENS(RoofFoundLine);
  // west - 外切矩形的西侧longitude
  // east - 外切矩形的东侧longitude
  // north - 外切矩形的北侧latitude
  // south - 外切矩形的南侧latitude
  const west = boundingWENS[0];
  const east = boundingWENS[1];
  const north = boundingWENS[2];
  const south = boundingWENS[3];

  // 太阳能板起伏角度的cos
  const panelCos = Math.cos((panelTiltAngle) * Math.PI / 180.0);
  // 太阳能板起伏角度的tan
  const panelTan = Math.tan((panelTiltAngle) * Math.PI / 180.0);
  // 太阳能板旋转角度cos
  const rotationCos = Math.abs(Math.cos(angleDiff * Math.PI / 180.0));
  // 屋顶鞋面倾角cos
  const pitchedRoofCos = Math.abs(Math.cos(obliquity * Math.PI / 180.0));
  // console.log('pitchedRoofCos')
  // console.log(pitchedRoofCos)
  // 斜面朝向和铺板朝向之间的角度差
  let lengthBrngDiff = BasicMath.angleBetweenBrngs(
    pitchedRoofPolygon.brng, -rotationAngle + 90
  );
  // console.log('lengthBrngDiff')
  // console.log(lengthBrngDiff)
  if (lengthBrngDiff > 90) lengthBrngDiff = 180 - lengthBrngDiff;
  const lengthBrngDiffCos = Math.abs(Math.cos(lengthBrngDiff * Math.PI / 180.0));
  const lengthBrngDiffSin = Math.abs(Math.sin(lengthBrngDiff * Math.PI / 180.0));
  // 板长度在平面的映射长度
  const xAxisLen = panelLength * lengthBrngDiffCos * pitchedRoofCos;
  const yAxisLen = panelLength * lengthBrngDiffSin;
  // console.log(xAxisLen)
  // console.log(yAxisLen)
  const flatPanelLength = Math.sqrt(
    xAxisLen * xAxisLen + yAxisLen * yAxisLen
  );
  // 板长度间距在平面的映射长度
  const xAxisLenOffset = lengthOffset * lengthBrngDiffCos * pitchedRoofCos;
  const yAxisLenOffset = lengthOffset * lengthBrngDiffSin;
  const flatLengthOffset = Math.sqrt(
    xAxisLenOffset * xAxisLenOffset + yAxisLenOffset * yAxisLenOffset
  );

  // 斜面朝向和铺板垂直朝向之间的角度差
  let widthBrngDiff = BasicMath.angleBetweenBrngs(
    pitchedRoofPolygon.brng, -rotationAngle
  );
  if (widthBrngDiff > 90) widthBrngDiff = 180 - widthBrngDiff;
  const widthBrngDiffCos = Math.abs(Math.cos(widthBrngDiff * Math.PI / 180.0));
  const widthBrngDiffSin = Math.abs(Math.sin(widthBrngDiff * Math.PI / 180.0));
  // console.log('widthBrngDiff')
  // console.log(widthBrngDiff)
  // 板宽度在平面的映射长度
  const xAxisWid = panelWidth * widthBrngDiffCos * panelCos;
  const yAxisWid = panelWidth * widthBrngDiffSin;
  const flatPanelWidth = Math.sqrt(
    xAxisWid * xAxisWid + yAxisWid * yAxisWid
  );
  // 板宽度度间距在平面的映射长度
  const xAxisWidOffset = widthOffset * widthBrngDiffCos * pitchedRoofCos;
  const yAxisWidOffset = widthOffset * widthBrngDiffSin;
  const flatWidthOffset = Math.sqrt(
    xAxisWidOffset * xAxisWidOffset + yAxisWidOffset * yAxisWidOffset
  );
  // console.log(flatPanelLength)
  // console.log(flatLengthOffset)
  // console.log(flatPanelWidth)
  // console.log(flatWidthOffset)

  // 板斜摆之后实际对应外切矩形宽度
  let edgeLengthCorrespondingPanelWidth = Math.abs(
    flatPanelWidth * rowPerArray / rotationCos
  );
  if (rotationAngle === 90 || rotationAngle === -90) {
    edgeLengthCorrespondingPanelWidth = flatPanelWidth * rowPerArray;
  }
  // 板间距斜摆之后实际对应外切矩形宽度
  let edgeLengthCorrespondingWidthOffset = Math.abs(
    flatWidthOffset / rotationCos
  );
  if (rotationAngle === 90 || rotationAngle === -90) {
    edgeLengthCorrespondingWidthOffset = flatWidthOffset;
  }

  // 每次向下平移0.1m，最多需要测试的铺板方案数
  const maximumPlansToTry = parseInt(
    (flatPanelWidth + flatWidthOffset) / 0.1,
    10
  );

  // 六种朝向模式
  let rotationMode = null;
  // 每种模式行的伸展方向
  let rowDirection = null;
  if (rotationAngle >= 0 && rotationAngle < 90) {
    // 输入朝向180到90
    rotationMode = 1;
    rowDirection = 180;
  } else if (rotationAngle === 90) {
    // 输入朝向90
    rotationMode = 2;
    rowDirection = 90;
  } else if (rotationAngle > 90 && rotationAngle < 180) {
    // 输入朝向90到0
    rotationMode = 3;
    rowDirection = 90;
  } else if (rotationAngle < 0 && rotationAngle > -90) {
    // 输入朝向180到270
    rotationMode = 4;
    rowDirection = 270;
  } else if (rotationAngle === -90) {
    // 输入朝向270
    rotationMode = 5;
    rowDirection = 270;
  } else if (
    (rotationAngle < -90 && rotationAngle >= -180) ||
    rotationAngle === 180
  ) {
    // 输入朝向270到360
    rotationMode = 6;
    rowDirection = 0;
  }

  // 铺板数据
  let maxPanelNum = 0;
  let drawingSequence = [];
  let endArraySequenceNum = initArraySequenceNum;

  // 判断空间是否够放一块板
  if (RoofFoundLine.polylineArea() < 2 * flatPanelWidth * flatPanelLength) {
    return null;
  }

  for (let planIndex = 0; planIndex < maximumPlansToTry; planIndex++) {
    // 阵列编码
    let arraySequenceNum = initArraySequenceNum;

    let breakable = 0;

    // 统计该方案总共能铺板数量
    let totalPossiblePanels = 0;
    const possibleDrawingSequence = [];

    // 北侧参考点，兼起始点
    let tempNorthCoordinate = null;
    switch (rotationMode) {
      default:
      case 1:
        tempNorthCoordinate = Coordinate.destination(
          new Coordinate(west, north, Coordinate.heightOfArbitraryNode(
            pitchedRoofPolygon, new Coordinate(west, north, 0)
          )),
          rowDirection,
          planIndex * 0.1 / rotationCos
        );
        break;
      case 2:
        tempNorthCoordinate = Coordinate.destination(
          new Coordinate(west, south, Coordinate.heightOfArbitraryNode(
            pitchedRoofPolygon, new Coordinate(west, south, 0)
          )),
          rowDirection,
          planIndex * 0.1
        );
        break;
      case 3:
        tempNorthCoordinate = Coordinate.destination(
          new Coordinate(west, south, Coordinate.heightOfArbitraryNode(
            pitchedRoofPolygon, new Coordinate(west, south, 0)
          )),
          rowDirection,
          planIndex * 0.1 / rotationCos
        );
        break;
      case 4:
        tempNorthCoordinate = Coordinate.destination(
          new Coordinate(east, north, Coordinate.heightOfArbitraryNode(
            pitchedRoofPolygon, new Coordinate(east, north, 0)
          )),
          rowDirection,
          planIndex * 0.1 / rotationCos
        );
        break;
      case 5:
        tempNorthCoordinate = Coordinate.destination(
          new Coordinate(east, north, Coordinate.heightOfArbitraryNode(
            pitchedRoofPolygon, new Coordinate(east, north, 0)
          )),
          rowDirection,
          planIndex * 0.1
        );
        break;
      case 6:
        tempNorthCoordinate = Coordinate.destination(
          new Coordinate(east, south, Coordinate.heightOfArbitraryNode(
            pitchedRoofPolygon, new Coordinate(east, south, 0)
          )),
          rowDirection,
          planIndex * 0.1 / rotationCos
        );
        break;
    }

    // 行数
    let rowNum = 0;
    let whileLoopCount = 0;
    while (breakable !== 2) {
      whileLoopCount += 1;
      // corNorthList - 北线交点坐标array
      const corNorthList = [];
      // 计算多边形每条线与北线的交点坐标，如果存在加入到corNorthList
      rooftopLineCollection.mathLineCollection.forEach(mathLine => {
        const northJoint = Coordinate.intersection(
          tempNorthCoordinate, -rotationAngle + 90,
          mathLine.originCor, mathLine.brng
        );
        if (northJoint !== undefined) {
          if (Coordinate.surfaceDistance(northJoint, mathLine.originCor) <
          mathLine.dist) {
            corNorthList.push({ cor: northJoint, type: 'wall' });
          }
        }
      });
      // 计算每个障碍物每条线与北线的交点坐标，如果存在加入到corNorthList
      allKeepoutLineCollection.forEach(kptLineCollection =>
        kptLineCollection.mathLineCollection.forEach(mathLine => {
          const northJoint = Coordinate.intersection(
            tempNorthCoordinate, -rotationAngle + 90,
            mathLine.originCor, mathLine.brng
          );
          if (northJoint !== undefined) {
            if (Coordinate.surfaceDistance(northJoint, mathLine.originCor) <
            mathLine.dist) {
              corNorthList.push({ cor: northJoint, type: 'keepout' });
            }
          }
        })
      );
      // 将corNorthList里的坐标排序
      switch (rotationMode) {
        default:
        case 4:
        case 1:
          corNorthList.sort(sortByCorLonAsc);
          break;
        case 2:
        case 3:
          corNorthList.sort(sortByCorLatAsc);
          break;
        case 5:
          corNorthList.sort(sortByCorLatDes);
          break;
        case 6:
          corNorthList.sort(sortByCorLonDes);
          break;
      }

      // 南侧参考点
      const tempSouthCoordinate = Coordinate.destination(
        tempNorthCoordinate,
        rowDirection,
        edgeLengthCorrespondingPanelWidth
      );
      // corSouthList - 南参考线交点坐标array
      const corSouthList = [];
      // 计算多边形每条线与北线的交点坐标，如果存在加入到corNorthList
      rooftopLineCollection.mathLineCollection.forEach(mathLine => {
        const southJoint = Coordinate.intersection(
          tempSouthCoordinate, -rotationAngle + 90,
          mathLine.originCor, mathLine.brng
        );
        if (southJoint !== undefined) {
          if (Coordinate.surfaceDistance(southJoint, mathLine.originCor) <
          mathLine.dist) {
            corSouthList.push({ cor: southJoint, type: 'wall' });
          }
        }
      });
      // 计算每个障碍物每条线与北线的交点坐标，如果存在加入到corSouthList
      allKeepoutLineCollection.forEach(kptLineCollection =>
        kptLineCollection.mathLineCollection.forEach(mathLine => {
          const southJoint = Coordinate.intersection(
            tempSouthCoordinate, -rotationAngle + 90,
            mathLine.originCor, mathLine.brng
          );
          if (southJoint !== undefined) {
            if (Coordinate.surfaceDistance(southJoint, mathLine.originCor) <
            mathLine.dist) {
              corSouthList.push({ cor: southJoint, type: 'keepout' });
            }
          }
        })
      );
      // 将corSouthList里的坐标排序
      switch (rotationMode) {
        default:
        case 4:
        case 1:
          corSouthList.sort(sortByCorLonAsc);
          break;
        case 2:
        case 3:
          corSouthList.sort(sortByCorLatAsc);
          break;
        case 5:
          corSouthList.sort(sortByCorLatDes);
          break;
        case 6:
          corSouthList.sort(sortByCorLonDes);
          break;
      }

      // 北线有交点 & breakable = 0 -> 开始与房屋相交
      if (corNorthList.length !== 0 && breakable === 0) {
        breakable = 1;
      }
      // 北线不再有交点 & breakable = 1 -> 开始不再与房屋相交，可以不再循环
      if (corNorthList.length === 0 && breakable === 1) {
        breakable = 2;
      }
      // whileLoop太长
      if (whileLoopCount > 1000) break;

      // 如果corNorthList里面只有一个交点，则跳入下一行
      if (corNorthList.length === 1 || corSouthList.length === 1) {
        tempNorthCoordinate = Coordinate.destination(
          tempSouthCoordinate,
          rowDirection,
          edgeLengthCorrespondingWidthOffset
        );
        continue;
      }

      // 针对corNorthList中的交点，两两一组
      for (let e = 0; e < corNorthList.length; e += 2) {
        // corNorthLeft - 北参考线靠西的交点
        const corNorthLeft = corNorthList[e].cor;
        // corNorthRight - 北参考线靠东的交点
        const corNorthRight = corNorthList[e + 1].cor;
        // 将北参考线的两交点转换到南参考线的位置
        const corNorthLeftToSouth = Coordinate.destination(
          corNorthLeft,
          -rotationAngle + 180,
          flatPanelWidth * rowPerArray
        );
        const corNorthRightToSouth = Coordinate.destination(
          corNorthRight,
          -rotationAngle + 180,
          flatPanelWidth * rowPerArray
        );

        for (let f = 0; f < corSouthList.length; f += 2) {
          // corSouthLeft - 南参考线靠西的交点
          const corSouthLeft = corSouthList[f].cor;
          // corSouthRight - 南参考线靠东的交点
          const corSouthRight = corSouthList[f + 1].cor;

          // 跳过这一组坐标的条件
          // 南坐标不在北坐标的范围内
          switch (rotationMode) {
            default:
            case 4:
            case 1:
              if (
                (corSouthLeft.lon > corNorthRightToSouth.lon) ||
                (corSouthRight.lon < corNorthLeftToSouth.lon)
              ) continue;
              break;
            case 2:
            case 3:
              if (
                (corSouthLeft.lat > corNorthRightToSouth.lat) ||
                (corSouthRight.lat < corNorthLeftToSouth.lat)
              ) continue;
              break;
            case 5:
              if (
                (corSouthLeft.lat < corNorthRightToSouth.lat) ||
                (corSouthRight.lat > corNorthLeftToSouth.lat)
              ) continue;
              break;
            case 6:
              if (
                (corSouthLeft.lon < corNorthRightToSouth.lon) ||
                (corSouthRight.lon > corNorthLeftToSouth.lon)
              ) continue;
              break;
          }

          // 西-南北比较西侧最靠里的点
          let leftRefCor = null;
          switch (rotationMode) {
            default:
            case 4:
            case 1:
              if (corNorthLeftToSouth.lon > corSouthLeft.lon) {
                leftRefCor = corNorthLeftToSouth;
              } else {
                leftRefCor = corSouthLeft;
              }
              break;
            case 2:
            case 3:
              if (corNorthLeftToSouth.lat > corSouthLeft.lat) {
                leftRefCor = corNorthLeftToSouth;
              } else {
                leftRefCor = corSouthLeft;
              }
              break;
            case 5:
              if (corNorthLeftToSouth.lat < corSouthLeft.lat) {
                leftRefCor = corNorthLeftToSouth;
              } else {
                leftRefCor = corSouthLeft;
              }
              break;
            case 6:
              if (corNorthLeftToSouth.lon < corSouthLeft.lon) {
                leftRefCor = corNorthLeftToSouth;
              } else {
                leftRefCor = corSouthLeft;
              }
              break;
          }

          // 东-南北比较东侧最靠里的点
          let rightRefCor = null;
          switch (rotationMode) {
            default:
            case 4:
            case 1:
              if (corNorthRightToSouth.lon < corSouthRight.lon) {
                rightRefCor = corNorthRightToSouth;
              } else {
                rightRefCor = corSouthRight;
              }
              break;
            case 2:
            case 3:
              if (corNorthRightToSouth.lat < corSouthRight.lat) {
                rightRefCor = corNorthRightToSouth;
              } else {
                rightRefCor = corSouthRight;
              }
              break;
            case 5:
              if (corNorthRightToSouth.lat > corSouthRight.lat) {
                rightRefCor = corNorthRightToSouth;
              } else {
                rightRefCor = corSouthRight;
              }
              break;
            case 6:
              if (corNorthRightToSouth.lon > corSouthRight.lon) {
                rightRefCor = corNorthRightToSouth;
              } else {
                rightRefCor = corSouthRight;
              }
              break;
          }

          let rightRefCorToNorth = Coordinate.destination(
            rightRefCor,
            -rotationAngle,
            flatPanelWidth * rowPerArray
          );
          let leftRefCorToNorth = Coordinate.destination(
            leftRefCor,
            -rotationAngle,
            flatPanelWidth * rowPerArray
          );

          const boxBot = new MathLine(
            leftRefCor,
            90 - rotationAngle,
            Coordinate.surfaceDistance(leftRefCor, rightRefCor)
          );
          const boxRight = new MathLine(
            rightRefCor,
            -rotationAngle,
            Coordinate.surfaceDistance(rightRefCor, rightRefCorToNorth)
          );
          const boxTop = new MathLine(
            rightRefCorToNorth,
            -rotationAngle - 90,
            Coordinate.surfaceDistance(rightRefCorToNorth, leftRefCorToNorth)
          );
          const boxLeft = new MathLine(
            leftRefCorToNorth,
            -rotationAngle - 180,
            Coordinate.surfaceDistance(leftRefCorToNorth, leftRefCor)
          );
          // 可能铺板矩形四条边的顶点，朝向，距离
          let possibleBoxLineCollection = new MathLineCollection(
            [boxBot, boxRight, boxTop, boxLeft]
          );

          // 检查有没有房屋顶点或障碍物顶点在矩形内
          const allRoofLineCorInBox = [];
          rooftopLineCollection.mathLineCollection.forEach(roofLine => {
            if (MyMath.corWithinLineCollectionPolygon(
              possibleBoxLineCollection, roofLine.originCor)
            ) {
              allRoofLineCorInBox.push(roofLine.originCor);
            }
          });
          allKeepoutLineCollection.forEach(kptMathLine => {
            kptMathLine.mathLineCollection.forEach(kptLine => {
              if (MyMath.corWithinLineCollectionPolygon(
                possibleBoxLineCollection, kptLine.originCor)
              ) {
                allRoofLineCorInBox.push(kptLine.originCor);
              }
            });
          });
          const leftCors = [];
          const rightCors = [];
          const boxMidCorToSouth = Coordinate.intersection(
            Coordinate.destination(
              possibleBoxLineCollection.mathLineCollection[0].originCor,
              Coordinate.bearing(
                possibleBoxLineCollection.mathLineCollection[0].originCor,
                possibleBoxLineCollection.mathLineCollection[2].originCor
              ),
              0.5 * Coordinate.surfaceDistance(
                possibleBoxLineCollection.mathLineCollection[0].originCor,
                possibleBoxLineCollection.mathLineCollection[2].originCor
              )
            ), -rotationAngle + 180,
            possibleBoxLineCollection.mathLineCollection[0].originCor,
            -rotationAngle + 90
          );
          const distSeperation = Coordinate.surfaceDistance(
            possibleBoxLineCollection.mathLineCollection[0].originCor,
            boxMidCorToSouth
          );
          allRoofLineCorInBox.forEach(cor => {
            const corToSouth = Coordinate.intersection(
              cor, -rotationAngle + 180,
              possibleBoxLineCollection.mathLineCollection[0].originCor,
              -rotationAngle + 90
            );
            const distToMid = Coordinate.surfaceDistance(
              corToSouth, boxMidCorToSouth
            );
            if (
              Coordinate.surfaceDistance(
                corToSouth,
                possibleBoxLineCollection.mathLineCollection[0].originCor
              ) < distSeperation
            ) {
              leftCors.push({ cor: corToSouth, dist: distToMid });
            } else {
              rightCors.push({ cor: corToSouth, dist: distToMid });
            }
          });
          leftCors.sort(sortByDist);
          rightCors.sort(sortByDist);

          if (leftCors.length !== 0) {
            leftRefCor = leftCors[0].cor;
            leftRefCorToNorth = Coordinate.destination(
              leftRefCor,
              -rotationAngle,
              flatPanelWidth * rowPerArray
            );
          }
          if (rightCors.length !== 0) {
            rightRefCor = rightCors[0].cor;
            rightRefCorToNorth = Coordinate.destination(
              rightRefCor,
              -rotationAngle,
              flatPanelWidth * rowPerArray
            );
          }
          if (leftCors.length > 0 || rightCors.length > 0) {
            const newboxBot = new MathLine(
              leftRefCor,
              90 - rotationAngle,
              Coordinate.surfaceDistance(leftRefCor, rightRefCor)
            );
            const newboxRight = new MathLine(
              rightRefCor,
              -rotationAngle,
              Coordinate.surfaceDistance(rightRefCor, rightRefCorToNorth)
            );
            const newboxTop = new MathLine(
              rightRefCorToNorth,
              -rotationAngle - 90,
              Coordinate.surfaceDistance(rightRefCorToNorth, leftRefCorToNorth)
            );
            const newboxLeft = new MathLine(
              leftRefCorToNorth,
              -rotationAngle - 180,
              Coordinate.surfaceDistance(leftRefCorToNorth, leftRefCor)
            );
            // 可能铺板矩形四条边的顶点，朝向，距离
            possibleBoxLineCollection = new MathLineCollection(
              [newboxBot, newboxRight, newboxTop, newboxLeft]
            );
          }

          // 检查可能铺板矩形是否在房屋外部/障碍物内部，如果存在跳过该可能铺板矩形
          const midTestCor = Coordinate.destination(
            possibleBoxLineCollection.mathLineCollection[0].originCor,
            Coordinate.bearing(
              possibleBoxLineCollection.mathLineCollection[0].originCor,
              possibleBoxLineCollection.mathLineCollection[2].originCor
            ),
            0.5 * Coordinate.surfaceDistance(
              possibleBoxLineCollection.mathLineCollection[0].originCor,
              possibleBoxLineCollection.mathLineCollection[2].originCor
            )
          );
          if (!MyMath.corWithinLineCollectionPolygon(
            rooftopLineCollection, midTestCor
          )) continue;
          let boxWithinKpt = false;
          allKeepoutLineCollection.forEach(kptMathLine => {
            if (MyMath.corWithinLineCollectionPolygon(
              kptMathLine, midTestCor
            )) boxWithinKpt = true;
          });
          if (boxWithinKpt) continue;

          // 检查铺板空间够不够长
          const maxHorizenDist = Coordinate.surfaceDistance(
            possibleBoxLineCollection.mathLineCollection[0].originCor,
            possibleBoxLineCollection.mathLineCollection[1].originCor
          );
          // colSpaceCheck - 检查该列空间是否够放一组阵列
          const colSpaceCheck = maxHorizenDist - (flatPanelLength * panelsPerRow);
          // cols - 该列能摆板的阵列数
          let cols = 0;
          if (colSpaceCheck >= 0) {
            cols = parseInt(
              colSpaceCheck /
              (flatPanelLength * panelsPerRow + flatLengthOffset), 10
            ) + 1;
          }

          let startingGap = null;
          if (align === 'left') {
            startingGap = 0;
          } else if (align === 'center') {
            startingGap = (
              maxHorizenDist - (flatPanelLength * panelsPerRow) -
              (cols - 1) * (flatPanelLength * panelsPerRow + flatLengthOffset)
            ) / 2;
          } else {
            startingGap = (
              maxHorizenDist - (flatPanelLength * panelsPerRow) -
              (cols - 1) * (flatPanelLength * panelsPerRow + flatLengthOffset)
            );
          }

          for (let c = 0; c < cols; c++) {
            const panelArray = [];
            const rowHeightCalibrateWest = [];
            const rowHeightCalibrateEast = [];
            for (let r = 0; r < rowPerArray; r++) {
              for (let p = 0; p < panelsPerRow; p++) {
                totalPossiblePanels += 1;
                const PVWestCor = Coordinate.destination(
                  Coordinate.destination(
                    possibleBoxLineCollection.mathLineCollection[0].originCor,
                    -rotationAngle + 90,
                    c * (flatPanelLength * panelsPerRow + flatLengthOffset) +
                    (flatPanelLength * p) + startingGap
                  ),
                  -rotationAngle,
                  flatPanelWidth * r
                );
                PVWestCor.setCoordinate(
                  null, null,
                  r === 0
                    ? Coordinate.heightOfArbitraryNode(
                      pitchedRoofPolygon, PVWestCor
                    ) + height
                    : rowHeightCalibrateWest[p] + flatPanelWidth * r * panelTan
                );
                if (r === 0) rowHeightCalibrateWest.push(PVWestCor.height);
                const PVEastCor = Coordinate.destination(
                  PVWestCor, -rotationAngle + 90,
                  flatPanelLength
                );
                PVEastCor.setCoordinate(
                  null, null,
                  r === 0
                    ? Coordinate.heightOfArbitraryNode(
                      pitchedRoofPolygon, PVEastCor
                    ) + height
                    : rowHeightCalibrateEast[p] + flatPanelWidth * r * panelTan
                );
                if (r === 0) rowHeightCalibrateEast.push(PVEastCor.height);
                // console.log(Coordinate.linearDistance(PVWestCor, PVEastCor))
                const PVWestNorthCor = Coordinate.destination(
                  PVWestCor, -rotationAngle,
                  flatPanelWidth
                );
                PVWestNorthCor.setCoordinate(
                  null, null,
                  PVWestCor.height + flatPanelWidth * panelTan
                );
                const PVEastNorthCor = Coordinate.destination(
                  PVEastCor, -rotationAngle,
                  flatPanelWidth
                );
                PVEastNorthCor.setCoordinate(
                  null, null,
                  PVEastCor.height + flatPanelWidth * panelTan
                );
                // console.log(Coordinate.linearDistance(PVWestNorthCor, PVWestCor))
                const pvPolyline = new Polyline([
                  Point.fromCoordinate(PVWestCor, 0.01),
                  Point.fromCoordinate(PVEastCor, 0.01),
                  Point.fromCoordinate(PVEastNorthCor, 0.01),
                  Point.fromCoordinate(PVWestNorthCor, 0.01)
                ]);
                let rowPos = null;
                if (c === 0 && c === cols - 1) {
                  rowPos = 'single';
                } else if (c === 0) {
                  rowPos = 'start';
                } else if (c === cols - 1) {
                  rowPos = 'end';
                } else {
                  rowPos = 'mid';
                }
                panelArray.push({
                  pvPolyline: pvPolyline,
                  height: height,
                  rowPos: rowPos,
                  sequence: arraySequenceNum,
                  col: c,
                  row: rowNum
                });
              }
            }
            possibleDrawingSequence.push(panelArray);
          }
          // 阵列编号++
          arraySequenceNum++;
        }
      }
      // 更新下一行的 tempNorthCoordinate
      tempNorthCoordinate = Coordinate.destination(
        tempSouthCoordinate,
        rowDirection,
        edgeLengthCorrespondingWidthOffset
      );
      // 行数++
      rowNum++;
    }
    drawingSequence.push({
      num: totalPossiblePanels,
      sequence: possibleDrawingSequence
    });
    // 判断是不是最大铺板方案
    if (totalPossiblePanels > maxPanelNum) {
      maxPanelNum = totalPossiblePanels;
      endArraySequenceNum = arraySequenceNum;
    }
  }
  drawingSequence = drawingSequence.filter(s => s.num === maxPanelNum);
  return [
    endArraySequenceNum,
    drawingSequence[Math.floor(drawingSequence.length / 2)].sequence
  ];
};

module.exports = {
  calculatePitchedRoofPanel
};
