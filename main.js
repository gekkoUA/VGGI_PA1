'use strict';

let gl;                         // WebGL контекст
let surface;                    // Наша поверхня Неовіуса
let shProgram;                  // Шейдерна програма
let spaceball;                  // Об'єкт для обертання мишкою

function deg2rad(angle) {
    return angle * Math.PI / 180;
}

// Конструктор шейдерної програми
function ShaderProgram(name, program) {
    this.name = name;
    this.prog = program;

    // Локації атрибутів та юніформ-змінних
    this.iAttribVertex = -1;
    this.iModelViewProjectionMatrix = -1;
    this.iColor = -1;

    this.Use = function() {
        gl.useProgram(this.prog);
    }
}

// Головна функція малювання (викликається постійно при обертанні)
function draw() { 
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Налаштування матриці проєкції (Perspective)
    let projection = m4.perspective(Math.PI / 8, 1, 1, 50);
    
    // Отримання матриці виду (View) від об'єкта обертання Trackball
    let modelView = spaceball.getViewMatrix();

    let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
    let translateToPointZero = m4.translation(0, 0, -20);

    let matAccum0 = m4.multiply(rotateToPointZero, modelView);
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0);
        
    let modelViewProjection = m4.multiply(projection, matAccum1);

    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);
    
    // Задаємо колір ліній (зелений: R=0, G=1, B=0, Alpha=1)
    gl.uniform4fv(shProgram.iColor, [0.0, 1.0, 0.0, 1.0]);

    // Виклик методу Draw нашої поверхні
    surface.Draw();
}

// Функція створення та компіляції шейдерної програми
function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vShader);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
     }

    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
       throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }

    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
       throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}

// Функція ініціалізації (викликається при завантаженні сторінки)
function init() {
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("message").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }

    try {
        // Змінні vertexShaderSource та fragmentShaderSource автоматично беруться 
        // з підключеного файлу shader.gpu
        let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        shProgram = new ShaderProgram('Basic', prog);
        shProgram.Use();

        shProgram.iAttribVertex              = gl.getAttribLocation(prog, "vertex");
        shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
        shProgram.iColor                     = gl.getUniformLocation(prog, "color");

        // СТВОРЕННЯ ОБ'ЄКТА ПОВЕРХНІ НЕОВІУСА (з neovius.js)
        surface = new Model("Neovius Surface");
        
        // Генеруємо дані поліліній і передаємо в буфери
        surface.BufferData(CreateNeoviusSurfaceData());

        gl.enable(gl.DEPTH_TEST);
    }
    catch (e) {
        document.getElementById("message").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    // Ініціалізація управління мишкою
    spaceball = new TrackballRotator(canvas, draw, 0);

    // Перший виклик малювання
    draw();
}