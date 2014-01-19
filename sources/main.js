$(function() {

	$(window).resize(function(){ 

		$('.full-height').css('height', $(window).height()); 
		if(viewer){ viewer.refresh() };

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
		this._$ = $('<li>') ;
		this._previous = null ;
		this._in = null ;

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

	/*---------------------------------------*/
	// Vue

	function PageMode(modeButton){

		var that = this ;
		this._mode = 1;
		this._button = $(modeButton) ;

		this.change = function(){};

		this._button.click(function(){

			switch(that._mode)
			{
				case 2: //Mode duo
				
					that._mode = 1 ;

					$view.show.removeClass('duo');
					$view.show.addClass('solo');

					that._button.text('Une page');

					break;

				case 1: //Mode solo

					that._mode = 2 ;

					$view.show.removeClass('solo');
					$view.show.addClass('duo');

					that._button.text('Deux pages');

					break;
			}

			that.change();
		});
	}

	function Viewer(container, images){

		var that = this ;
			
			this.container = container ;
			this.arrows = $view.toolbar.arrows ;
				this.arrows.left = $(this.arrows.left);
				this.arrows.right = $(this.arrows.right);

			this.mode = new PageMode( $view.toolbar.pageMode ) ;

			this.images = [];
			this.currentIndex = 0 ;

		//Fonctions de l'objet
			this.unset = function(){

				this.container.empty();
			}

			this.refresh = function(){
				this.container.css('left', ( ($(window).width() - this.container.width())/2 + 'px' ));
				this.container.css('max-height', ( ($(window).height() - $view.toolbar.$.height() - 10) + 'px' ));
			}

		//On place les listeners
			this.mode.change = function(){ that.refresh(); }

			that.arrows.left.click(function(){

				that.images[ that.currentIndex ].removeClass('current');

				if(that.currentIndex > 0){
					that.mode._mode == 2 ? that.currentIndex -= 2 : that.currentIndex -= 1 ;
				}

				that.images[ that.currentIndex ].addClass('current');
				that.colorizeArrows();
			});

			that.arrows.right.click(function(){

				that.images[ that.currentIndex ].removeClass('current');

				if(that.currentIndex < that.images.length-1){
					that.mode._mode == 2 ? that.currentIndex += 2 : that.currentIndex += 1 ;
				}

				that.images[ that.currentIndex ].addClass('current');
				that.colorizeArrows();
			});

			this.colorizeArrows = function(){
				that.currentIndex == 0 ? that.arrows.left.addClass('disabled') : that.arrows.left.removeClass('disabled');
				that.currentIndex == that.images.length-1 ? that.arrows.right.addClass('disabled') : that.arrows.right.removeClass('disabled');
			}

		//Et on fait le rendu
			images.each(function(){

				that.images.push( $('<img>').attr('src', $(this).children('img').attr('src')) );
			});

			that.images.forEach(function(element){
				that.container.append( element );
			});

			that.images[ this.currentIndex ].addClass('current');
			this.refresh();
			this.colorizeArrows();
	}

});
