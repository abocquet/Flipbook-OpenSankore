$(function() {

	$(window).resize(function(){ 

		$('.full-height').css('height', $(window).height()); 
		if(viewer != null){ viewer.refreshWidth() ; };

	}).resize();

	var $view = {
		content: $('#content'),
		gallery: $('.gallery ul'),
		viewer:  $('.viewer'),
		show:    $('#show .book'),
		toolbar: {
			$: $('#toolbar'),
			pageMode: $.find('#page-mode'),
			switchMode: $.find('#switch-mode'),
			arrows: {
				left: $.find("#prev-page"),
				right: $.find("#next-page")
			}
		},
		images:  []
	}

	var mode = new Mode( $view.toolbar.switchMode );
	var viewer = null ;

	/*--------------------------------------*/
	// Modification

	function Picture(url){
		this.$li = $('<li>')
			.addClass('image') 
			.append( 
				$('<img>')
					.prop('src', url)
			)
			.append(
				$('<input>')
				.attr('type', 'button')
				.attr('value', 'supprimer')
				.addClass('button')
				.addClass('delete')
				.click(function(){

					var parent = $(this).parent();

					parent.next().remove();
					parent.remove();

				})
			)
		;

		this.after = function(previous)
		{
			this.$li.insertAfter( previous );
		}
	}

	function Adder(){
		this._$ = $('<li>')
			.addClass('adder') ;
		this._previous = null ;
		this._in = null ;
		this._before = null ;

		this.init = function(){

			var id = (new Date()).getTime() / Math.random();
			this._$
				.append( 
					$('<input>')
					.attr('type', 'file')
					.attr('multiple', '')
					.attr('id', id)
					.hide()
					.change(function() {

						appendPhotos(this, this.files);
							
					})
					.bind('dragenter', function(){ return false ; })
				)
				.append(
					$('<label>')
					.text('Ajouter un fichier')
					.addClass('add')
					.attr('for', id)
					.on('dragenter', function(e){ $(this).addClass('dragging'); e.stopPropagation(); e.preventDefault(); })
					.on('dragover', function(e){  e.stopPropagation(); e.preventDefault(); })
					.on('dragleave', function(e){  $(this).removeClass('dragging'); })
					.on('drop', function(e){ 

						appendPhotos(this, e.originalEvent.dataTransfer.files);
						e.stopPropagation();
						e.preventDefault();
						$(this).removeClass('dragging');

					})
				)

				if(this._in)
				{
					this._$.appendTo( this._in );
				} else if(this._previous)
				{
					this._$.insertAfter( this._previous );
				} else if(this._before)
				{
					this._$.insertBefore( this._before );
				}
			
		}
	}

	function Group(url){

		this._picture = new Picture(url);
		this._adder = new Adder();

		this.after = function(element){

			this._picture.after(element);
			this._adder._previous = this._picture.$li ;
			this._adder.init();

		}
	}

	function Mode(modeButton){

		var that = this ;
		this._mode = 'edit';
		this._button = $(modeButton) ;

		this.mode = function(mode){
			if(mode == 'edit' || mode == 'view')
			{
				if(this._mode != 'mode')
				{
					this._button.trigger('click');
				}

				return this ;
			}
			else
			{
				return this._mode ;
			}
		};

		this._button.click(function(){

			switch(that._mode)
			{
				case 'view': //Mode vue
				
					that._mode = 'edit' ;

					$view.content.removeClass('view');
					$view.content.addClass('edit');

					that._button.text('Mode édition');
					
					$view.toolbar.$.css('right', '0px');

					viewer.unset();	
					viewer = null ;	

					break;

				case 'edit': //Mode edition
					$view.images = $('.image');

					if( $view.images.length == 0)
					{
						alert('Il n\'y a encore aucune image');
					}
					else
					{
						that._mode = 'view' ;

						$view.content.removeClass('edit');
						$view.content.addClass('view');

						that._button.text('Mode vue');

						$view.toolbar.$.css('right', ( ($(window).width() - $view.toolbar.$.width())/2 + 'px' ));
						viewer = new Viewer($view.show, $view.images);

						break;
					}
			}
		});
	}

	function appendPhotos(element, files)
	{
		var element = $(element),
			filesLen = files.length,
			imgType;
		
		for (var i = 0 ; i < filesLen ; i++) {
			
			imgType = files[i].name.split('.');
			imgType = imgType[imgType.length - 1];
			
			if(allowedTypes.indexOf(imgType) != -1) {
				var reader = new FileReader();

				reader.onload = function() {

					var group = new Group(this.result);
					element.parent().hasClass('out-of-list') ? group.after( $view.gallery.children().last() ) : group.after( element.parent() ) ;

				};
				
				reader.readAsDataURL(files[i]);
			}
		}		
	}

	var allowedTypes = ['png', 'jpg', 'jpeg', 'gif'];

	var adder = new Adder;
		adder._in = $('#main-add ul') ;
		adder._$.addClass('out-of-list');
		adder.init();

	var adder = new Adder;
		adder._in = $view.gallery ;
		adder.init();

		/*------------------------*/
		// Gestion du drag'n'drop

		$view.gallery.sortable({

			axis: 'y',
			placeholder: "sortable-placeholder",
			items: ".image",
			forcePlaceholderSize: true,
			tolerance: "pointer",
			
			start: function(){
				$('.adder:not(.out-of-list)').remove();
				$('.delete').hide();
			},

			stop: function(){

				var adder = new Adder;
					console.log( $view.gallery.children().first());
					adder._before = $view.gallery.children().first() ;
					adder.init();

				$('.image').each(function(){

					var adder = new Adder;
						adder._previous = this ;
						adder.init();

				})

				$('.delete').show();
			}

		});

	/*---------------------------------------*/
	// Vue

	function PageMode(modeButton, container){

		var that = this ;
		this._mode = 1;
		this._button = $(modeButton) ;
		this.container = container ;

		this.change = function(){};

		this._button.click(function(){

			switch(that._mode)
			{
				case 2: //Mode duo
					that.mode(1, true);
					break;

				case 1: //Mode solo
					that.mode(2, true);
					break;
			}

		});

		//Si persist est à false, seul la vue sera rafraichie (utile lorsqu'on est en mode 2 pages mais que l'on ne veut afficher que la première ou la dernière)
		this.mode = function(mode, persist){

			switch(mode){
				case 1:

					this.container.removeClass('duo');
					this.container.addClass('solo');

					if(persist == true){ 
						that._mode = 1 ; 
						that._button.text('Une page');
						that.change();
					}

					break;
				case 2:

					this.container.removeClass('solo');
					this.container.addClass('duo');

					if(persist == true){ 
						that._mode = 2 ; 
						that._button.text('Deux pages');
						that.change();
					}

					break;
			}

			return that._mode
		}
	}

	function Page(url, index){

		this._image = $('<img>').attr('src', url) ;
		this._index = index ;
		this._number = $('<p>')
			.text(this._index + 1)
			.addClass('page-number')
		;

		this.$ = $('<div>')
			.addClass('page')
			.append( this._image  )
			.append( this._number )
		;

		this.show = function(mode)
		{
			this.$.addClass('current');
		}

		this.hide = function(){
			this.$.removeClass('current');
		}
	}

	function Viewer(container, images){

		var that = this ;
			
			this.container = container ;
			this.arrows = $view.toolbar.arrows ;
				this.arrows.left = $(this.arrows.left);
				this.arrows.right = $(this.arrows.right);

			this.mode = new PageMode( $view.toolbar.pageMode, this.container ) ;
				this.mode.mode(1, true)

			this.pages = [];
			this.currentIndex = 0 ;

		//Fonctions de l'objet
			this.unset = function(){

				this.container.empty();
			}

			this.refreshWidth = function(){
				this.container.css('left', ( ($(window).width() - this.container.width())/2 + 'px' ));
				this.container.css('max-height', ( ($(window).height() - $view.toolbar.$.height() - 10) + 'px' ));
			}

		//On place les listeners
			this.mode.change = function(){ 
				that.toIndex( that.currentIndex - (that.currentIndex % this._mode ) );
				that.refreshWidth(); 
			}

			that.arrows.left.click(function(){

				if(that.currentIndex > 0){

					that.toIndex(
						that.mode.mode() == 2 ? that.currentIndex - 2 : that.currentIndex - 1
					);
				}

			});

			that.arrows.right.click(function(){

				if(that.currentIndex < that.pages.length - that.mode.mode()){
					that.toIndex(
						 that.mode.mode() == 2 ? that.currentIndex + 2 : that.currentIndex + 1
					);
				}

			});

			that.toIndex = function(index){

				that.pages[ that.currentIndex ].hide();

				that.currentIndex = index ;
				that.pages[ that.currentIndex ].show( that.mode.mode() );

				that.refreshWidth();
				that.colorizeArrows();
			}

			this.colorizeArrows = function(){
				that.currentIndex == 0 ? that.arrows.left.addClass('disabled') : that.arrows.left.removeClass('disabled');
				that.currentIndex == that.pages.length - that.mode.mode() ? that.arrows.right.addClass('disabled') : that.arrows.right.removeClass('disabled');
			}

		//Et on fait le rendu
			var i = 0 ;
			images.each(function(){

				var page = new Page($(this).children('img').attr('src'), i);
					that.pages.push( page );
					that.container.append( page.$ );

				i++ ;
			});

			that.pages[ this.currentIndex ].show();
			this.refreshWidth();
			this.colorizeArrows();
	}

});
