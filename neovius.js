function Model(name) {
    this.name = name;
    this.iVertexBuffers = [];
    this.counts = [];

    this.BufferData = function(verticesList) {
        for (let i = 0; i < verticesList.length; i++) {
            let buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesList[i]), gl.STREAM_DRAW);
            
            this.iVertexBuffers.push(buffer);
            this.counts.push(verticesList[i].length / 3);
        }
    }

    this.Draw = function() {
        for (let i = 0; i < this.iVertexBuffers.length; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffers[i]);
            gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(shProgram.iAttribVertex);
            
            gl.drawArrays(gl.LINE_STRIP, 0, this.counts[i]);
        }
    }
}

function CreateNeoviusSurfaceData() {
    let polylines = [];
    
    const step = Math.PI / 20; 
    const min = -Math.PI / 2;
    const max = Math.PI / 2;

    for (let v = min; v <= max; v += step) {
        let zLinesPos = [], zLinesNeg = [];
        let xLinesPos = [], xLinesNeg = [];
        let yLinesPos = [], yLinesNeg = [];
        
        for (let u = min; u <= max; u += step) {
            let arg = calculateArgument(u, v);
            if (arg !== null) {
                let w = Math.acos(arg);

                zLinesPos.push(u, v, w);
                zLinesNeg.push(u, v, -w);

                xLinesPos.push(w, u, v);
                xLinesNeg.push(-w, u, v);

                yLinesPos.push(v, w, u);
                yLinesNeg.push(v, -w, u);
            }
        }
        polylines.push(zLinesPos, zLinesNeg, xLinesPos, xLinesNeg, yLinesPos, yLinesNeg);
    }

    for (let u = min; u <= max; u += step) {
        let zLinesPos = [], zLinesNeg = [];
        let xLinesPos = [], xLinesNeg = [];
        let yLinesPos = [], yLinesNeg = [];
        
        for (let v = min; v <= max; v += step) {
            let arg = calculateArgument(u, v);
            if (arg !== null) {
                let w = Math.acos(arg);

                zLinesPos.push(u, v, w);
                zLinesNeg.push(u, v, -w);

                xLinesPos.push(w, u, v);
                xLinesNeg.push(-w, u, v);

                yLinesPos.push(v, w, u);
                yLinesNeg.push(v, -w, u);
            }
        }
        polylines.push(zLinesPos, zLinesNeg, xLinesPos, xLinesNeg, yLinesPos, yLinesNeg);
    }

    return polylines;
}

function calculateArgument(u, v) {
    let cosU = Math.cos(u);
    let cosV = Math.cos(v);
    let denominator = 3 + 4 * cosU * cosV;
    
    if (Math.abs(denominator) > 0.0001) {
        let arg = -3 * (cosU + cosV) / denominator;
        return Math.max(-1, Math.min(1, arg));
    }
    return null;
}