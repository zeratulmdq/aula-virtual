<template>
	<div class="container" :class="{'container--shrink': shrinkContainer}">
		<div class="content--body" :style="{height: calculatedHeight}" ref="aca">
			<textarea v-model="content" id="copiaescondida" class="copiaescondida"></textarea>	
		</div>
	</div>
</template>
<script>
	import CodeMirror from 'codemirror'
	require('codemirror/mode/javascript/javascript');
  	require('codemirror/addon/selection/active-line');
    require('codemirror/addon/selection/mark-selection');

	export default {
		name: 'avCode',
		data() {
			return {
				content: '',
				codemirror: null,
				cursor: { line:0, ch:0 },
                head: {},
                tail: {},
                mark: [],
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
			 * Return the codemirror init values
			 * 
			 * @return Object
			 */
			initOptions() {
				return this.$store.state.codemirrorInit;
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
                return this.$store.state.shrinkTopMenu ? 'calc(100vh - 100px)' : 'calc(100vh - 230px)';
            }
		},
		methods: {
			/**
			 * Create a new Codemirror instance
			 * 
			 * @return void
			 */
			initCodeMirror() {
				this.codemirror = CodeMirror(this.$refs.aca,{
                    mode: 'javascript',
                    lineNumbers: true,
                    lineWrapping: true,
                    styleActiveLine: true,
                    styleSelectedText: true
                });
			},

			/**
			 * Set codemirror instance text
			 * 
			 * @param data Object
			 * @return void
			 */
			setText(data) {
				this.content = data;
                this.codemirror.setValue(this.content);
                this.codemirror.setCursor(this.cursor);
			},

			/**
			 * Set codemirror instance cursor
			 * 
			 * @param data Object
			 * @return void
			 */
			setCursor(data) {
				if(this.cursor.line != data.line)
                {
                    this.codemirror.setCursor(data);
                    this.cursor = data;
                }
			},

			/**
			 * Set codemirror instance selection
			 * 
			 * @param data Object
			 * @return void
			 */
			setSelection(data) {
				 if(this.mark[0])
                    this.mark[0].clear();

                this.mark[0] = this.codemirror.markText(data.start, data.end, {className: "codemiror-styled-background"});
			},

			/**
			 * Register an event handler for
			 * the socket text event
			 * 
			 * @return void
			 */
			registerSocketTextEvent() {
				this.$socket.on('codemirror.text', (data) => {
					this.setText(data);
                });
			},

			/**
			 * Register an event handler for
			 * the socket cursor event
			 * 
			 * @return void
			 */
			registerSocketCursorEvent() {
				this.$socket.on('codemirror.cursor', (data) => {
            		this.setCursor(data); 
                });
			},

			/**
			 * Register an event handler for
			 * the socket selection event
			 * 
			 * @return void
			 */
			registerSocketSelectionEvent() {
				this.$socket.on('codemirror.selection', (data) => {
                   this.setSelection(data);
                });
			},

			/**
			 * Register an event handler for
			 * the socket init event
			 * 
			 * @return void
			 */
			registerSocketCodemirrorInit() {
				this.$socket.on('codemirror.init', (data) => {
					this.setText(data.text);
					this.setCursor(data.cursor);
					this.setSelection(data.selection);
				});
				this.$socket.emit('codemirror.init');
			},

			/**
			 * Register an event handler for
			 * the codemiror change event
			 * 
			 * @return void
			 */
			registerCodeMirrorChangeEvent() {
				this.codemirror.on('change', () => {
					if(this.root)
					{
						this.content = this.codemirror.getValue();
                    	this.$socket.emit('codemirror.text', this.codemirror.getValue());
					}
                });
			},

			/**
			 * Register an event handler for
			 * the codemiror cursorActivity event
			 * 
			 * @return void
			 */
			registerCodeMirrorCursorEvent() {
				this.codemirror.on('cursorActivity', (instance) => {
                    if(this.root){
                        let start = instance.getCursor('start'),
                        	end = instance.getCursor('end');

                        if(start != this.head || end != this.tail)
                        {
                            this.$socket.emit('codemirror.cursor', instance.getCursor());
                            this.head = start;
                            this.tail = end;
                            this.$socket.emit('codemirror.selection', {start: start, end: end});
                        }
                    }
                });
			},
		},
		mounted() {
			this.initCodeMirror();
			this.registerSocketTextEvent();
			this.registerSocketCursorEvent();
			this.registerSocketSelectionEvent();
			this.registerCodeMirrorChangeEvent();
            this.registerCodeMirrorCursorEvent();
            this.registerSocketCodemirrorInit();
		}
	}
</script>
<style>
	.copiaescondida {
        height: 0px;
        width: 0px;
        top: -100px;
        left: -100px;
        position: absolute;
    }
    .codemiror-styled-background {
    	background-color: #FFF051;
    }
    .content--body {
    	overflow: auto;
    }
</style>