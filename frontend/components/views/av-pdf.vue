<template>
	<div class="container" :class="{'container--shrink': shrinkContainer}">
		<div v-show="root">
			<form id="pdf" method="post" enctype="multipart/form-data" action="/api/pdf" class="dropzone"></form>
			<div class="pdf__change pdf__change--left" @click="prevPage">
				<i class="fa fa-angle-double-left"></i>
			</div>
			<div class="pdf__change pdf__change--right" @click="nextPage">
				<i class="fa fa-angle-double-right"></i>
			</div>
		</div>
		<div class="pdf__wrapper" v-show="pdfDoc.numPages" :style="{height: calculatedHeight}">
			<div class="col-md-4 col-md-offset-4 separar">
				<!--<span @click="render(currentPage - 1)" class="spanPdf" v-show="root && currentPage > 1">&lt;&lt;</span>
				<span>{{ currentPage }} / {{ totalPages }}</span>
				<span @click="render(currentPage + 1)" class="spanPdf" v-show="root && currentPage < totalPages">&gt;&gt;</span>-->
			</div>
			<canvas class="canvasPdf" id="pdfViewer"></canvas>
		</div>
		<div v-show="!pdfDoc.numPages" class="box-body">
			<p class="no-files">{{ $t('pdf.noPdf') }}</p>
		</div>
	</div>
</template>
<script>

	import pdfjsLib from 'pdfjs-dist'
	import worker from 'pdf-worker'
	import dropzone from 'dropzone'
	
	pdfjsLib.PDFJS.workerSrc = worker;

	export default {
		name: 'avPdf',
		data() {
			return {
				pageRendering: false,
                pageNumPending: null,
                scale: 1,
                canvas: null,
                ctx: null,
                viewport: null,
                pdfDoc: {
					numPages: 0,
					fingerprint: ''
				},
                currentPage: 1,
				dropzone: null,
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
			 * Get JWT token
			 * 
			 * @return String	JWT token
			 */
			token() {
				return this.$store.state.token;
			},

			/**
			 * Return pdf initial values
			 * 
			 * @return Object
			 */
			initOptions() {
				return this.$store.state.pdfInit;
			},

			/**
			 * Return the current classroom
			 * 
			 * @return String
			 */
			aula() {
				return this.$store.state.classroom;
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
			nextPage() {
				if(this.currentPage < this.pdfDoc.numPages)
				{
					this.renderPage(++this.currentPage);
					this.$socket.emit('pdf.changePage', this.currentPage);
				}
			},
			prevPage() {
				if(this.currentPage > 1)
				{
					this.renderPage(--this.currentPage);
					this.$socket.emit('pdf.changePage', this.currentPage);
				}
			},
			loadFile(path, page = 1) {
				pdfjsLib.getDocument(path).then((pdfDoc_) => {
                    this.pdfDoc = pdfDoc_;

                    this.pdfDoc.getPage(this.currentPage).then((page) => {
                        if(this.viewport == null)
                        {
                            this.scale = 1;
                            this.viewport = page.getViewport(this.scale);
                            let ratioH = window.innerHeight/this.viewport.height,
                                ratioW = window.innerWidth/this.viewport.width,
                                ratio = ratioH < ratioW ? ratioH : ratioW;
                            
                            this.canvas.height = this.viewport.height * ratio;
                            this.canvas.width = this.viewport.width * ratio;    
                            this.scale = ratio;
                        }

                        this.renderPage(this.currentPage);
                    });
                });
			},
			/**
			 * Register an event handler for
			 * the socket pdf.changePage event
			 * 
			 * @return void
			 */
	    	registerSocketPdfChangePageEvent() {
	    		this.$socket.on('pdf.changePage', (data) => {
	    			if(!this.root)
	    			{
	    				this.renderPage(data);
	    			}
				});
	    	},

	    	/**
			 * Register an event handler for
			 * the socket pdf.newFile event
			 * 
			 * @return void
			 */
	    	registerSocketPdfNewFileEvent() {
	    		this.$socket.on('pdf.newFile', (data) => {
	    			this.loadFile(data.path);
				});
	    	},


	    	

            renderPage(num) {
                this.pageRendering = true;
                // Using promise to fetch the page
                this.pdfDoc.getPage(num).then((page) => {
                    var viewport = page.getViewport(this.scale);
                    
                    // Render PDF page into canvas context
                    var renderContext = {
                        canvasContext: this.ctx,
                        viewport: viewport
                    };
                    var renderTask = page.render(renderContext);

                    // Wait for rendering to finish
                    renderTask.promise.then(() => {
                        this.pageRendering = false;
                        if (this.pageNumPending !== null) {
                        // New page rendering is pending
                            this.renderPage(this.pageNumPending);
                            this.pageNumPending = null;
                        }
                    });
                });
            },

            /**
            * If another page rendering in progress, waits until the rendering is
            * finised. Otherwise, executes rendering immediately.
            */
            queueRenderPage(num) {
                if (this.pageRendering) {
                    this.pageNumPending = num;
                } else {
                    this.renderPage(num);
                }
            },
		},
		created() {
			this.registerSocketPdfChangePageEvent();
			this.registerSocketPdfNewFileEvent();

		},
		mounted() {
			/**
			 * Init dropzone instance
			 */
			this.dropzone = new dropzone("#pdf", {
				paramName: 'file',
				maxFilesize: 5, // MB
				clickable: true,
				previewsContainer: false,
				dictDefaultMessage: '<i class="fa fa-upload"></i>',
				acceptedFiles: ".pdf, .doc, .docx, .odt, .ppt, .pps, .pptx, .ppts",
				headers: {
					"x-access-token": this.token,
					"x-classroom-name": this.aula.name,
				}
			});
            this.canvas = document.getElementById('pdfViewer');
            this.ctx = this.canvas.getContext('2d');
            
            if(this.initOptions && this.initOptions.file)
					this.loadFile(this.initOptions.file.path, this.initOptions.currentPage);
		}
	}
</script>
<style>
	.pdfViewer {
		margin: 0 auto;
		text-align: center;
		position: relative;
	}
	.pdf__wrapper {
		overflow-y: auto; 
		overflow-x: hidden;
	}

	.canvasPdf {
		margin: 0 auto;
	}

	.separar {
		margin-bottom: 10px;
	}

	.spanPdf {
		margin: 0 15px;
		font-size: 20px;
		font-weight: bold;
	}

	.pdf__change {
	    position: fixed;
	    bottom: 10px;
	    cursor: pointer;
	    background-color: #d32f2f;
	    font-size: 25px;
	    height: 50px;
	    border-radius: 50%;
	    display: flex;
	    color: #FFF;
	    width: 50px;
	    align-items: center;
	    justify-content: center;
	    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.23), 0 3px 10px rgba(0, 0, 0, 0.16);
	}

	.pdf__change--left {
		left: 70px;
	}

	.pdf__change--right {
		left: 130px;
	}	
</style>