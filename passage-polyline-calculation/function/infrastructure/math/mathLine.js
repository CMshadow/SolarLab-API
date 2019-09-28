class MathLine {
  constructor(originCor=null, brng=null, dist=null, dest=null) {
    this.originCor = originCor ? originCor : null;
    this.brng = brng !== null ? brng : null;
    this.dist = dist ? dist : null;
    this.dest = dest ? dest : null;
  }
}

module.exports = MathLine;
