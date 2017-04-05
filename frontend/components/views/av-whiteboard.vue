<template>
	<div class="container whiteboard__center" :class="{'container--shrink': shrinkContainer}">
		<div class="whiteboard__picker" v-if="root">
			<slider-color v-model="colors" @change-color="onChange"></slider-color>
			<a class="whiteboard__clear btn__danger" @click="clear">
				<i class="fa fa-undo" aria-hidden="true"></i>
			</a>
		</div>
		<canvas id="drawCanvas" width="800" height="600">Tu navegador no soporta Canvas.</canvas>
	</div>
</template>
<script>
	import { Slider } from 'vue-color'

	export default {
		name: 'avWhiteboard',
		components: {
			'slider-color': Slider
		},
		data() {
			return {
				colors: {
					hex: '#194d33',
					hsl: {
						h: 150,
						s: 0.5,
						l: 0.2,
						a: 1
					},
					hsv: {
						h: 150,
						s: 0.66,
						v: 0.30,
						a: 1
					},
					rgba: {
						r: 25,
						g: 77,
						b: 51,
						a: 1
					},
					a: 1
				},
				sarasa: '',
				canvas: null,
				ctx: null,
				isTouchSupported: false,
				isPointerSupported: false,
				isMSPointerSupported: false,
				downEvent: '',
				moveEvent: '',
				upEvent: '',
				isActive: false,
		    	plots: [],
			}
		},
		computed: {
			/**
			 * Check if user is in control
			 * of the app
			 * 
			 * @return boolean
			 */
			root() {
				return this.$store.getters.root;
			},
			/**
			 * Get the current user in control
			 * 
			 * @return Object (User)
			 */
			userInCharge() {
				return this.$store.state.userInCharge;
			},

			/**
             * Check if top menu is
             * shrinked
             * 
             * @return boolean
             */
            shrinkContainer() {
                return this.$store.state.shrinkTopMenu;
            },

            /**
             * Calculate container height
             * based on menu size
             * 
             * @return String
             */
            calculatedHeight() {
                return this.$store.state.shrinkTopMenu ? 'calc(100vh - 120px)' : 'calc(100vh - 230px)';
            }
		},
		methods: {
			onChange (val) {
  this.colors = val
},
			/**
			 * Get canvas element and init events
			 * 
			 * @return void
			 */
			initCanvas() {
				this.canvas = document.getElementById('drawCanvas');
				this.ctx = this.canvas.getContext('2d');
			 
				this.ctx.strokeStyle = this.colors.hex;
				this.ctx.lineWidth = '3';
				this.ctx.lineCap = this.ctx.lineJoin = 'round';
				this.canvas.addEventListener(this.downEvent, this.startDraw, false);
				this.canvas.addEventListener(this.moveEvent, this.draw, false);
				this.canvas.addEventListener(this.upEvent, this.endDraw, false);

				for(var i=0; i<this.$store.state.whiteboard.length; i++)
					this.drawFromStream(this.$store.state.whiteboard[i]);
			},

			/**
			 * Check and init events and options
			 * 
			 * @return void
			 */
			initOptions() {
				this.isTouchSupported = 'ontouchstart' in window;
				this.isPointerSupported = navigator.pointerEnabled;
				this.isMSPointerSupported =  navigator.msPointerEnabled;
				this.downEvent = this.isTouchSupported ? 'touchstart' : (this.isPointerSupported ? 'pointerdown' : (this.isMSPointerSupported ? 'MSPointerDown' : 'mousedown'));
				this.moveEvent = this.isTouchSupported ? 'touchmove' : (this.isPointerSupported ? 'pointermove' : (this.isMSPointerSupported ? 'MSPointerMove' : 'mousemove'));
				this.upEvent = this.isTouchSupported ? 'touchend' : (this.isPointerSupported ? 'pointerup' : (this.isMSPointerSupported ? 'MSPointerUp' : 'mouseup'));
			},

			/**
			 * Clear canvas and emit associated
			 * socket event
			 * 
			 * @return void
			 */
			clear() {
				if(this.ctx && this.root)
				{
					this.clearCanvas();
					this.$socket.emit('whiteboard.clear');
				}
			},

			/**
			 * Clear canvas
			 * 
			 * @return void
			 */
			clearCanvas() {
				this.ctx.clearRect(0, 0, 800, 600);
			},

			/**
			 * Register an event handler for
			 * the socket draw event
			 * 
			 * @return void
			 */
			registerSocketDrawEvent() {
				this.$socket.on('whiteboard.draw', (data) => {
			        this.drawFromStream(data);
			    });
			},

			/**
			 * Register an event handler for
			 * the socket clear event
			 * 
			 * @return void
			 */
			registerSocketClearEvent() {
				this.$socket.on('whiteboard.clear', () => {
			    	this.clearCanvas();
			    });
			},

			/**
			 * Emit a socket draw event
			 * 
			 * @return void
			 */
			emitDraw(data) {
				if(this.root)
					this.$socket.emit('whiteboard.draw', data);
			},

			/**
			 * Configure options and start
			 * drawing.
			 * 
			 * @param  Event e
			 * @return void
			 */
			draw(e) {
				// prevent continuous touch event process e.g. scrolling!
				e.preventDefault(); 
			  	if(!this.isActive) return;

		    	var x = this.isTouchSupported ? (e.targetTouches[0].pageX - this.canvas.offsetLeft) : (e.offsetX || e.layerX - this.canvas.offsetLeft);
		    	var y = this.isTouchSupported ? (e.targetTouches[0].pageY - this.canvas.offsetTop) : (e.offsetY || e.layerY - this.canvas.offsetTop);

		    	// round numbers for touch screens
		    	this.plots.push({x: (x << 0), y: (y << 0)}); 

		    	this.drawOnCanvas(this.colors.hex, this.plots);
			},

			/**
			 * Set options to start drawing
			 * 
			 * @param  Event e
			 * @return void
			 */
			startDraw(e) {
			  	e.preventDefault();
			  	this.isActive = true;
			},

			/**
			 * Set options after drawing and
			 * emit socket event
			 * 
			 * @param  Event e
			 * @return void
			 */
			endDraw(e) {
			  	e.preventDefault();
			  	this.isActive = false;
			  	this.emitDraw({
			  		color: this.colors.hex,
			  		plots: this.plots
			  	});

			  	this.plots = [];
			},

			/**
			 * Draw a set of lines from a stream
			 * 
			 * @param  Array lines Set of lines to draw
			 * @return void
			 */
			drawFromStream(lines) {
				if(!lines || !lines.plots || lines.plots.length < 1) return;
				this.drawOnCanvas(lines.color, lines.plots);
		    },

		    /**
		     * Perform actual drawing on canvas
		     * 
		     * @param  String color
		     * @param  Array plots
		     * @return void
		     */
		    drawOnCanvas(color, plots) {
		    	this.ctx.strokeStyle = color || 'black';
				this.ctx.beginPath();
				this.ctx.moveTo(plots[0].x, plots[0].y);

		    	for(var i=1; i<plots.length; i++) {
			    	this.ctx.lineTo(plots[i].x, plots[i].y);
			    }
			    this.ctx.stroke();
		    }
		},
		created() {
			this.initOptions();
		},
		mounted() {
			// This should go here and not in the created hook
			// to assure #drawcanvas is already in the DOM
			this.initCanvas();
			this.registerSocketClearEvent();
			this.registerSocketDrawEvent();
		}
	}
</script>
<style>
	#drawCanvas {
	  	-ms-touch-action: none;
		border: 1px solid #000;
	    /*background-color: #1a5f96;*/
	    background-image: url("/images/grilla.png");
    	background-repeat: repeat;
	}
	#drawCanvas:hover, #drawCanvas:active {
	  cursor: url('data:image/x-icon;base64,AAACAAEAICAAAAEAAQCoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgYDGhoGA70aBgO9GgYDNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoGAxoaBgO9fnl5/4yHh/8aBgO9GgYDNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaBgMaGgYDvX55ef9XTEr/v7+//62oqP8aBgO9GgYDNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgYDGhoGA71+eXn/V0xK/7+/v/9pXlz/6enp/8jEw/8aBgO9GgYDNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoGAxoaBgO9fnl5/6urq/+/v7//aV5c/+np6f+rpKL//////87Jyf8aBgO9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaBgMaGgYDvX55ef+rq6v/v7+//9XV1f/p6en/q6Si//////+vqKf/6Obl/xoGA70AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgYDGhoGA71+eXn/q6ur/7+/v//V1dX/6enp//j4+P//////r6in/+jm5f97b27/GgYDvQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoGAxoaBgO9fnl5/6urq/+/v7//1dXV/+np6f/4+Pj////////////o5uX/e29u/87Jyf8aBgO9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaBgMaGgYDvX55ef+rq6v/v7+//9XV1f/p6en/+Pj4/////////////////3tvbv/Oycn/6Obl/xoGA70AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgYDGhoGA71+eXn/q6ur/7+/v//V1dX/6enp//j4+P////////////////97b27/zsnJ///////o5uX/GgYDvQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoGAxoaBgO9fnl5/6urq/+/v7//1dXV/+np6f/4+Pj/////////////////e29u/87Jyf//////6Obl/xoGA70aBgM3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaBgMaGgYDvX55ef+rq6v/v7+//9XV1f/p6en/+Pj4/////////////////3tvbv/Oycn//////+jm5f8aBgO9GgYDNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgYDGhoGA71+eXn/q6ur/7+/v//V1dX/6enp//j4+P////////////////97b27/zsnJ///////o5uX/GgYDvRoGAzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoGAxoaBgO9fnl5/1dMSv+/v7//1dXV/+np6f/4+Pj/////////////////e29u/87Jyf//////6Obl/xoGA70aBgM3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaBgMaGgYDvX55ef+rq6v/v7+//2leXP/p6en/+Pj4/////////////////3tvbv/Oycn//////+jm5f8aBgO9GgYDNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgYDGhoGA71+eXn/q6ur/7+/v//V1dX/6enp/6ukov////////////////97b27/zsnJ///////o5uX/GgYDvRoGAzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoGAxoaBgO9fnl5/6urq/+/v7//1dXV/+np6f/4+Pj//////6+op//o5uX/VUZE/87Jyf//////6Obl/xoGA70aBgM3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaBgMaGgYDvX55ef+rq6v/v7+//9XV1f/p6en/+Pj4////////////6Obl/1VGRP9VRkT/zsnJ/+jm5f8aBgO9GgYDNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgYDGhoGA71+eXn/q6ur/7+/v//V1dX/6enp//j4+P////////////////9VRkT/GgYDNxoGAzcaBgM3GgYDvRoGAzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoGAxoaBgO9fnl5/6urq/+/v7//1dXV/+np6f/4+Pj/////////////////VUZE/xoGAzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaBgMaGgYDvX55ef+rq6v/v7+//9XV1f/p6en/+Pj4/////////////////1VGRP8aBgM3AAAAAAAA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'), 
	  pointer;
	}

	.whiteboard__picker {
		overflow: visible;
		position: relative;
		width: 800px;
		margin: 0 auto 25px;
	}

	.whiteboard__picker > div {
		margin: 0 auto;
	}

	.whiteboard__clear {
		position: absolute;
	    height: 50px;
	    width: 50px;
	    font-size: 25px;
	    display: flex;
	    color: #FFF;
	    align-items: center;
	    justify-content: center;
	    bottom: -50px;
	    left: -25px;
	    border-radius: 50%;
	    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.23), 0 3px 10px rgba(0, 0, 0, 0.16);
	    border-right: none;
	}

	.whiteboard__center {
		position: relative;
		text-align: center;
	}

	@media all and (orientation: landscape) {
		canvas {
			display: inline-block;
			margin-right: 10px;
		}
	}
</style>