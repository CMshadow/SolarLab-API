class MathLine {
  constructor (originCor = null, brng = null, dist = null) {
    this.originCor = originCor || null;
    this.brng = brng !== null ? brng : null;
    this.dist = dist || null;
  }
}

module.exports = MathLine;
