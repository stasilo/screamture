;(function(App, undefined) {
    App.Components = (App.Components || {});
    "use strict";

    App.Components.Screamture = function () {
        var NR_OF_SEGMENTS = 10 // level of detail of sculpture, for example 12 gives a total point count of 484
        var MODEL_FILE_NAME = 'skriktur';

        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.mesh = null;
        this.controls = null;

        this.deformedBoxDataASides = null;
        this.deformedBoxDataBSides = null;
        this.totalNoDataPoints = 0;

        this.__construct = function() {
            this.frequencyRecorder = new App.Components.FrequencyRecorder();
            this.keyboardControlHandler = new App.Components.KeyboardControlHandler();
            this.countdownHandler = new App.Components.CountdownHandler();
            this.progressbarHandler = new App.Components.ProgressbarHandler();

            this.__setupHandlers();
            this.__initialize();
        }

        this.__setupHandlers = function() {
            this.modalHandler = new App.Components.ModalHandler({
                onCloseCb: function() {
                    this.rotationPaused = true;

                    this.__slideCamera(1000, function() {
                        this.countdownHandler.startCountdown(300, 3000, function() {
                            this.frequencyRecorder.startRecording();
                        }.bind(this));
                    }.bind(this));
                }.bind(this)
            });

            this.buttonHandler = new App.Components.ButtonHandler({
                recordButtonCb: function() {
                    if(this.frequencyRecorder.isRecording()) {
                        return;
                    }

                    this.progressbarHandler.setProgress(0);

                    this.countdownHandler.startCountdown(300, 3000, function() {
                        this.frequencyRecorder.startRecording();
                    }.bind(this));
                }.bind(this),

                exportButtonCb: function() {
                    if(this.frequencyRecorder.isRecording()) {
                        return;
                    }

                    console.log("SAVING STL MODEL FILE!");
                    this.__exportStlModel();
                }.bind(this)
            });

            $(document).on('stasilo.animation-paused', function(e) {
                this.rotationPaused = true;
            }.bind(this));

            $(document).on('stasilo.animation-resumed', function(e) {
                this.rotationPaused = false;
            }.bind(this));

            $(document).on('stasilo.fade-in-cube', function(e) {
                this.__fadeInCubeColor(800);
            }.bind(this));
        }.bind(this);

        this.__initialize = function() {
            this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
            this.camera.position.z = -50; // 400
            this.camera.position.y = -50; //0
            this.camera.position.x = 0; //0

            this.scene = new THREE.Scene();
            this.scene.add( new THREE.AmbientLight( 0xffffff ) );

            var light = new THREE.DirectionalLight( 0xffffff, 0.5, 5000 );
            light.position.set( 0, 100, -200 ); //default; light shining from top
            light.castShadow = true; // default false
            this.scene.add( light );

            var light2 = new THREE.DirectionalLight( 0xffffff, 0.5, 5000 );
            light2.position.set( -200, 100, 0 ); //default; light shining from top
            light2.castShadow = true;  // default false
            this.scene.add( light2 );

            var geometry = new THREE.BoxBufferGeometry( 100, 200, 400, NR_OF_SEGMENTS, NR_OF_SEGMENTS, NR_OF_SEGMENTS );

            geometry.computeVertexNormals(); //neccessary for correct shadows

            this.colorMaterial = new THREE.MeshLambertMaterial( {
                color: 0x999999,
                morphTargets: true,
                //morphNormals: true,
                //vertexColors: THREE.VertexColors, //THREE.FaceColors,
                shading: THREE.SmoothShading, //THREE.FlatShading
                //wireframe: true,
                transparent: true,
                opacity: 0.5
            })

            this.wireMaterial = new THREE.MeshLambertMaterial( {
                color: 0x999999, //0xdddddd,
                wireframe: true,
                transparent: true
            } );

            this.mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
                this.wireMaterial,
                this.colorMaterial
            ]);

            this.mesh.geometry = geometry;
            this.mesh.receiveShadow = true;
            this.mesh.castShadow = true;

            this.scene.add( this.mesh );

            var vertices = this.mesh.geometry.attributes.position.array;

            this.deformedBoxDataASides = this.__deformBoxSides({
                sideOffset: 0,
                vertices: vertices,
                addOffsetSidePadding: true,
                saveVertices: true,
                verticeModifierFn: function() { return Math.random()*1 } // no deform
            });

            //skip one side to reach correct sides
            var sideOffset = this.deformedBoxDataASides.currentSideOffset;

            this.deformedBoxDataBSides = this.__deformBoxSides({
                sideOffset: sideOffset,
                vertices: vertices,
                // addOffsetSidePadding: false,
                addOffsetSidePadding: true,
                saveVertices: true,
                verticeModifierFn: function() { return Math.random()*1; } // no deform
            });

            var sideOffset2 = this.deformedBoxDataBSides.currentSideOffset;

            this.deformedBoxDataCSides = this.__deformBoxSides({
                sideOffset: sideOffset2,
                vertices: vertices,
                addOffsetSidePadding: false,
                saveVertices: true,
                nrOfSides: 1,
                verticeModifierFn: function() { return Math.random()*1; } // no deform
            });

            this.totalNoDataPoints = Math.floor(this.deformedBoxDataBSides.totalPoints*2);

            this.frequencyRecorder.setNoOfDataPoints(this.totalNoDataPoints);

            console.log("Total number of points in play: " + this.totalNoDataPoints);

            this.mesh.geometry.attributes.position.needsUpdate = true;

            this.renderer = new THREE.WebGLRenderer();

            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setSize( window.innerWidth, window.innerHeight );

            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            document.body.appendChild( this.renderer.domElement );

            this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
            this.controls.minDistance = 100;
            this.controls.maxDistance = 500;

            window.addEventListener( 'resize', this.__onWindowResize, false );
            this.__animate();
        }.bind(this);

        //export stl model file
        this.__exportStlModel = function() {
            var exporter = new THREE.STLBinaryExporter();
            var stlData = exporter.parse( this.scene );
            var blob = new Blob([stlData], {type: 'application/octet-binary'});

            saveAs(blob, MODEL_FILE_NAME + '.stl');
        }.bind(this);

        this.__onWindowResize = function() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }.bind(this);

        this.__fadeInCubeColor = function(duration) {
            var opacity = {value: this.colorMaterial.opacity};
            var fadeInTween = new TWEEN.Tween(opacity);
            fadeInTween.to({
                value: 1.0
            }, duration);

            fadeInTween.onUpdate(function(){
                this.colorMaterial.opacity = opacity.value;
            }.bind(this));

            fadeInTween.start();
            fadeInTween.onComplete(function() {
                this.wireMaterial.visible = false;
            }.bind(this));
        }.bind(this);

        this.__slideCamera = function(duration, onCompleteCb) {
            var position = {
                x: this.camera.position.x,
                y: this.camera.position.y,
                z: this.camera.position.z
            };

            var cameraSlideTween = new TWEEN.Tween(position);
            cameraSlideTween.to({
                x: 0,
                y: 0,
                z: 400
            }, duration);

            cameraSlideTween.onUpdate(function() {
                this.camera.position.x = position.x;
                this.camera.position.y = position.y;
                this.camera.position.z = position.z;

                this.camera.lookAt(this.mesh);
            }.bind(this));

            cameraSlideTween.easing(TWEEN.Easing.Back.InOut);
            cameraSlideTween.onComplete(onCompleteCb);

            cameraSlideTween.start();
        }.bind(this);

        this.__animate = function() {
            requestAnimationFrame( this.__animate );

            this.frequencyRecorder.update();

            if(!this.rotationPaused) {
                if(!this.frequencyRecorder.isRecording()) {
                    this.mesh.rotation.x += 0.005/2;
                    this.mesh.rotation.y += 0.01/2;
                } else {
                    this.mesh.rotation.x += 0.008;
                    this.mesh.rotation.y += 0.01;
                }
            }

            TWEEN.update();

            if(this.frequencyRecorder.hasRecorded() && !this.frequencyRecorder.isRecording()) {
                this.controls.update();
            }

            if(this.frequencyRecorder.isRecording()) {
                var currentProgress = this.frequencyRecorder.getCompletedPercentage();
                this.progressbarHandler.setProgress(currentProgress);
            }

            var vertices = this.mesh.geometry.attributes.position.array;

            var deformData = this.__deformBoxSides({
                sideOffset: 0,
                vertices: vertices,
                addOffsetSidePadding: true,
                saveVertices: false,
                baseVertices: this.deformedBoxDataASides.origVertices,
                verticeModifierFn: function(index) {
                    return this.frequencyRecorder.getCurrentFrequencyHistory(index) + (this.frequencyRecorder.isRecording() ? Math.random() * 5 : Math.random() * 5);
                }.bind(this)
            });

            //skip one side to reach correct sides
            var sideOffset = deformData.currentSideOffset;
            var startCountAt = deformData.totalPoints;

            var deformData2 = this.__deformBoxSides({
                sideOffset: sideOffset,
                vertices: vertices,
                addOffsetSidePadding: true,
                saveVertices: false,
                baseVertices: this.deformedBoxDataBSides.origVertices,
                startPointCountAt: startCountAt,
                verticeModifierFn: function(index) {
                    return this.frequencyRecorder.getCurrentFrequencyHistory(index) + (this.frequencyRecorder.isRecording() ? Math.random() * 5 : Math.random() * 5);
                }.bind(this)
            });

            //skip one side to reach correct sides
            var sideOffset2 = deformData2.currentSideOffset;
            var startCountAt2 = deformData2.totalPoints;

            this.__deformBoxSides({
                sideOffset: sideOffset2,
                vertices: vertices,
                addOffsetSidePadding: false,
                saveVertices: false,
                baseVertices: this.deformedBoxDataCSides.origVertices,
                startPointCountAt: startCountAt,
                nrOfSides: 1,
                verticeModifierFn: function(index) {
                    return this.frequencyRecorder.getCurrentFrequencyHistory(index) + (this.frequencyRecorder.isRecording() ? Math.random() * 5 : Math.random() * 5);
                }.bind(this)
            });

            this.mesh.geometry.computeVertexNormals();
            this.mesh.geometry.attributes.position.needsUpdate = true;

            this.renderer.render( this.scene, this.camera );
        }.bind(this);

        this.__deformBoxSides = function(options) {
            var NUM_OF_SIDES = 2;

            var sideOffset = options.sideOffset || 0;
            var vertices = options.vertices;
            var addOffsetSidePadding = options.addOffsetSidePadding;
            var saveVertices = options.saveVertices;
            var baseVertices = options.baseVertices;
            var verticeModifierFn = options.verticeModifierFn;
            var startPointCountAt = typeof options.startPointCountAt !== 'undefined' ? options.startPointCountAt : 0;
            var saveVertices = typeof options.saveVertices !== 'undefined' ? options.saveVertices : true;
            var nrOfSides = typeof options.nrOfSides !== 'undefined' ? options.nrOfSides : NUM_OF_SIDES;
            var origVertices = [];

            var totalNumberOfPoints = startPointCountAt;
            for(var s = 0; s < nrOfSides; s++) {
                var i = 0, j = 0;
                origVertices[s] = [];

                // trail and error and some guessswork while thinking in threes ^___^
                for(i = 3 * (NR_OF_SEGMENTS + 1) + sideOffset, j = 0; i < (3 * (NR_OF_SEGMENTS + 1)) * NR_OF_SEGMENTS + sideOffset; i+=3, j++) {
                    //skip first and last row of vertices to preserve box integrity/continuity
                    if(j == NR_OF_SEGMENTS) {
                        j = -1;
                        continue;
                    } else if (j == 0) {
                        continue;
                    }

                    //both sides outwards
                    var heightOffset = verticeModifierFn() * ((s == 0) ? 1 : -1);

                    //both sides inwards
                    // var heightOffset = 50 * ((c == 1) ? 1 : -1);

                    if(saveVertices) {
                        origVertices[s][i] = vertices[i] + heightOffset;
                    }

                    if(typeof baseVertices ==='undefined') {
                        vertices[i] = vertices[i] + heightOffset;
                    } else {
                        vertices[i] = baseVertices[s][i] + verticeModifierFn(totalNumberOfPoints) * ((s == 0) ? 1 : -1);
                    }

                    totalNumberOfPoints++;
                }

                sideOffset = i + (3 * (NR_OF_SEGMENTS +1 ));
            }

            if(addOffsetSidePadding) {
                sideOffset = (i+1) + (3 * (NR_OF_SEGMENTS + 1 ));
            }

            return {
                currentSideOffset: sideOffset,
                origVertices: origVertices,
                totalPoints: totalNumberOfPoints,
                currentPointIndex: totalNumberOfPoints
            };
        }.bind(this);

        this.__construct();
    };
})(window.App = window.App || {});
