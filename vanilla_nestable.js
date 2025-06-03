;(function(window, document)
{
    var hasTouch = 'ontouchstart' in document;

    var hasPointerEvents = (function()
    {
        var el    = document.createElement('div'),
            docEl = document.documentElement;
        if (!('pointerEvents' in el.style)) {
            return false;
        }
        el.style.pointerEvents = 'auto';
        el.style.pointerEvents = 'x';
        docEl.appendChild(el);
        var supports = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
        docEl.removeChild(el);
        return !!supports;
    })();

    var defaults = {
            listNodeName    : 'ol',
            itemNodeName    : 'li',
            rootClass       : 'dd',
            listClass       : 'dd-list',
            itemClass       : 'dd-item',
            dragClass       : 'dd-dragel',
            handleClass     : 'dd-handle',
            collapsedClass  : 'dd-collapsed',
            placeClass      : 'dd-placeholder',
            noDragClass     : 'dd-nodrag',
            emptyClass      : 'dd-empty',
            expandBtnHTML   : '<button data-action="expand" type="button">Expand</button>',
            collapseBtnHTML : '<button data-action="collapse" type="button">Collapse</button>',
            group           : 0,
            maxDepth        : 5,
            threshold       : 20
        };

     function Plugin(element, options) {
        this.window = window || global; 
        this.document = document || {};  // SSR uyumluluğu
        this.element = element; //vanilla js element
       this.element.dataset.nestableGroup = options.group;
        this.options = Object.assign({}, defaults, options); //$.extend({}, defaults, options);
        this.init();
    }

    Plugin.prototype = {

        init: function()
        {
            var list = this;

            list.reset();

            list.element.dataset.nestableGroup = this.options.group;

           
        
           var placeElement = document.createElement('div');
            placeElement.className = list.options.placeClass;
          
           list.placeEl          = placeElement;
           console.log('placeEl', list.placeEl);    
            var items = this.element.querySelectorAll(list.options.itemNodeName);
                for (var i = 0; i < items.length; i++) {
                    list.setParent(items[i]);  // ✅ DOM elementi gönderiliyor
                }

                this.element.addEventListener('click', function(e) {
                    if (e.target.matches('button')) {
                        if (list.dragEl) return;
                        
                        const target = e.target;
                        const action = target.dataset.action;
                        const item = target.closest(list.options.itemNodeName);
                        
                        if (action === 'collapse') {
                            list.collapseItem(item);
                        }
                        if (action === 'expand') {
                            list.expandItem(item);
                        }
                    }
                });

            const onStartEvent = function(e) {
                // jQuery: var handle = $(e.target);
                let handle = e.target;
                
                
                if (!handle.classList.contains(list.options.handleClass)) {
                    
                    if (handle.closest('.' + list.options.noDragClass)) {
                        return;
                    }
                    handle = handle.closest('.' + list.options.handleClass);
                }
            
                if (!handle || list.dragEl) {
                    return;
                }
            
                list.isTouch = /^touch/.test(e.type);
                if (list.isTouch && e.touches.length !== 1) {
                    return;
                }
            
                e.preventDefault();
                list.dragStart(e.touches ? e.touches[0] : e);
            };

            var onMoveEvent = function(e)
            {
                if (list.dragEl) {
                    e.preventDefault();
                    list.dragMove(e.touches ? e.touches[0] : e);
                }
            };

            var onEndEvent = function(e)
            {
                if (list.dragEl) {
                    e.preventDefault();
                    list.dragStop(e.touches ? e.touches[0] : e);
                }
            };

            if (hasTouch) {
                this.element.addEventListener('touchstart', onStartEvent, false);
                window.addEventListener('touchmove', onMoveEvent, false);
                window.addEventListener('touchend', onEndEvent, false);
                window.addEventListener('touchcancel', onEndEvent, false);
            }

            this.element.addEventListener('mousedown', onStartEvent);
            window.addEventListener('mousemove', onMoveEvent);
            window.addEventListener('mouseup', onEndEvent);
        },

        serialize: function()
        {
            var depth = 0;
            var list = this;
            
            function step(level, depth) {
                var array = [];
                // jQuery selector yerine vanilla js kullanımı
                var items = level.querySelectorAll(':scope > ' + list.options.itemNodeName);
                
                items.forEach(function(item) {
                    // jQuery data() yerine dataset kullanımı
                    var itemData = {};
                    for(var key in item.dataset) {
                        itemData[key] = item.dataset[key];
                    }
                    
                    // Alt elemanları bul
                    var subItems = item.querySelectorAll(':scope > ' + list.options.listNodeName);
                    
                    if(subItems.length) {
                        itemData.children = step(subItems[0], depth + 1);
                    }
                    
                    array.push(itemData);
                });
                
                return array;
            }
            
            var firstList = this.element.querySelector(this.options.listNodeName);
            return step(firstList, depth);
        },

        serialise: function()
        {
            return this.serialize();
        },

        reset: function()
        {
            this.mouse = {
                offsetX   : 0,
                offsetY   : 0,
                startX    : 0,
                startY    : 0,
                lastX     : 0,
                lastY     : 0,
                nowX      : 0,
                nowY      : 0,
                distX     : 0,
                distY     : 0,
                dirAx     : 0,
                dirX      : 0,
                dirY      : 0,
                lastDirX  : 0,
                lastDirY  : 0,
                distAxX   : 0,
                distAxY   : 0
            };
            this.isTouch    = false;
            this.moving     = false;
            this.dragEl     = null;
            this.dragRootEl = null;
            this.dragDepth  = 0;
            this.hasNewRoot = false;
            this.pointEl    = null;
        },

        expandItem: function(liEl) {
            console.log('_expan-dItem', liEl);

      

            liEl.classList.remove(this.options.collapsedClass);

            const expandEl = liEl.querySelector('[data-action="expand"]');
            if (expandEl) expandEl.style.display = 'none';

            const collapseEl = liEl.querySelector('[data-action="collapse"]');
            if (collapseEl) collapseEl.style.display = '';

            const listNode = liEl.querySelector(this.options.listNodeName);
            if (listNode) listNode.style.display = '';



        },

        collapseItem: function(li) {
            // Vanilla JS: li'nin direkt çocuklarında listNodeName kontrolü
            var hasChildList = false;
            var children = li.children;
            
            for (var i = 0; i < children.length; i++) {
                if (children[i].tagName.toLowerCase() === this.options.listNodeName.toLowerCase()) {
                    hasChildList = true;
                    break;
                }
            }
            
            if (hasChildList) {
                // jQuery: li.addClass(this.options.collapsedClass);
                // Vanilla JS:
                li.classList.add(this.options.collapsedClass);
                
                // jQuery: li.children('[data-action="collapse"]').hide();
                // Vanilla JS:
                var collapseBtn = li.querySelector('[data-action="collapse"]');
                if (collapseBtn) {
                    collapseBtn.style.display = 'none';
                }
                
                // jQuery: li.children('[data-action="expand"]').show();
                // Vanilla JS:
                var expandBtn = li.querySelector('[data-action="expand"]');
                if (expandBtn) {
                    expandBtn.style.display = '';
                }
                
                // jQuery: li.children(this.options.listNodeName).hide();
                // Vanilla JS: list node'unu gizle
                var listNode = li.querySelector(this.options.listNodeName);
                if (listNode) {
                    listNode.style.display = 'none';
                }
            }
        },

       expandAll: function() {
            var self = this;
            var items = this.element.querySelectorAll(this.options.itemNodeName);
            for (var i = 0; i < items.length; i++) {
                self.expandItem(items[i]);
            }
        },
     
        collapseAll: function() {
            var self = this;
            var items = this.element.querySelectorAll(this.options.itemNodeName);     
            for (var i = 0; i < items.length; i++) {
                self.collapseItem(items[i]);
            }
        },

        setParent: function(li) {
            
            console.log('li', li);
            if (li && li.jquery) {
                li = li[0];
            }
              
            var hasChildList = false;
            var children = li.children;
            
            // Alt elemanlar arasında listNodeName var mı kontrol et
            for (var i = 0; i < children.length; i++) {
                if (children[i].tagName.toLowerCase() === this.options.listNodeName.toLowerCase()) {
                    hasChildList = true;
                    break;
                }
            }
    
        if (hasChildList) {
            // this.options.expandBtnHTML kullanarak expand button oluştur
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.options.expandBtnHTML;
            var expandBtn = tempDiv.firstChild;
            li.insertBefore(expandBtn, li.firstChild);
            
            var tempDiv2 = document.createElement('div');
            tempDiv2.innerHTML = this.options.collapseBtnHTML;
            var collapseBtn = tempDiv2.firstChild;
            li.insertBefore(collapseBtn, li.firstChild);
            
            // Expand button'ı gizle (default olarak collapsed değil)
            expandBtn.style.display = 'none';
        }
},

        unsetParent: function(li)
        {
          console.log('unsetParent :li', li);
            if (li && li.jquery) {
                li = li[0];
            }
            // Collapsed class'ını kaldır
            li.classList.remove(this.options.collapsedClass);
            
            // [data-action] butonlarını kaldır (expand/collapse butonları)
            var actionButtons = li.querySelectorAll('[data-action]');
            for (var i = 0; i < actionButtons.length; i++) {
                if (actionButtons[i].parentNode) {
                    actionButtons[i].parentNode.removeChild(actionButtons[i]);
                }
            }
            
            // Alt liste node'larını kaldır
            var listNodes = li.querySelectorAll(this.options.listNodeName);
            for (var i = 0; i < listNodes.length; i++) {
                if (listNodes[i].parentNode) {
                    listNodes[i].parentNode.removeChild(listNodes[i]);
                }
            }
        },

        dragStart: function(e)
        {
            var mouse = this.mouse;
            var target = e.target;
            var dragItem = target.closest(this.options.itemNodeName);
            
            this.placeEl.style.height = dragItem.offsetHeight + 'px';
            
            // Touch ve mouse olayları için farklı hesaplama
            if (e.touches) {
                var touch = e.touches[0];
                var rect = target.getBoundingClientRect();
                mouse.offsetX = touch.pageX - (rect.left + window.scrollX);
                mouse.offsetY = touch.pageY - (rect.top + window.scrollY);
                mouse.startX = mouse.lastX = touch.pageX;
                mouse.startY = mouse.lastY = touch.pageY;
            } else {
                var rect = target.getBoundingClientRect();
                mouse.offsetX = e.offsetX !== undefined ? e.offsetX : e.pageX - (rect.left + window.scrollX);
                mouse.offsetY = e.offsetY !== undefined ? e.offsetY : e.pageY - (rect.top + window.scrollY);
                mouse.startX = mouse.lastX = e.pageX;
                mouse.startY = mouse.lastY = e.pageY;
            }

            this.dragRootEl = this.element;
              
             var dragEl    =    document.createElement(this.options.listNodeName);
             dragEl.className = this.options.listClass + ' ' + this.options.dragClass;

            this.dragEl = dragEl;

            dragEl.style.width = dragItem.offsetWidth + 'px';

            dragItem.parentNode.insertBefore(this.placeEl, dragItem.nextSibling);
            dragItem.parentNode.removeChild(dragItem);
          
            dragEl.appendChild(dragItem);
        
            document.body.appendChild(dragEl);
            
            dragEl.style.left = (e.pageX - mouse.offsetX) + 'px';
            dragEl.style.top = (e.pageY - mouse.offsetY) + 'px';

        
            // total depth of dragging item
            var items = dragEl.querySelectorAll(this.options.itemNodeName);
            for (var i = 0; i < items.length; i++) {
                var node = items[i];
                var depth = 0;
                while (node.parentNode) {
                    if (
                        node.parentNode.nodeName.toLowerCase() ===
                        this.options.listNodeName.toLowerCase()
                    ) {
                        depth++;
                    }
                    node = node.parentNode;
                }
                if (depth > this.dragDepth) {
                    this.dragDepth = depth;
                }
            }
        },

        dragStop: function(e)
        {
            // jQuery objelerini DOM elementlerine çevir - gelecekte direkt DOM olacak
                var placeElement = this.placeEl;
                
                var el = this.dragEl.querySelector(this.options.itemNodeName);
                
                el.parentNode.removeChild(el);
                
                placeElement.parentNode.replaceChild(el, placeElement);
                
                this.dragEl.parentNode.removeChild(this.dragEl);
                
                
                this.element.dispatchEvent(new Event('change', { bubbles: true }));
                
                if (this.hasNewRoot) {
                        
                        this.dragRootEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
                this.reset();
        },

        dragMove: function(e)
        {
            var list, parent, prev, next, depth,
                opt   = this.options,
                mouse = this.mouse;
              
            
           

                this.dragEl.style.left = (e.pageX - mouse.offsetX) + 'px';
                this.dragEl.style.top = (e.pageY - mouse.offsetY) + 'px';
           
            // mouse position last events
            mouse.lastX = mouse.nowX;
            mouse.lastY = mouse.nowY;
            // mouse position this events
            mouse.nowX  = e.pageX;
            mouse.nowY  = e.pageY;
            // distance mouse moved between events
            mouse.distX = mouse.nowX - mouse.lastX;
            mouse.distY = mouse.nowY - mouse.lastY;
            // direction mouse was moving
            mouse.lastDirX = mouse.dirX;
            mouse.lastDirY = mouse.dirY;
            // direction mouse is now moving (on both axis)
            mouse.dirX = mouse.distX === 0 ? 0 : mouse.distX > 0 ? 1 : -1;
            mouse.dirY = mouse.distY === 0 ? 0 : mouse.distY > 0 ? 1 : -1;
            // axis mouse is now moving on
            var newAx   = Math.abs(mouse.distX) > Math.abs(mouse.distY) ? 1 : 0;

            // do nothing on first move
            if (!mouse.moving) {
                mouse.dirAx  = newAx;
                mouse.moving = true;
                return;
            }

            // calc distance moved on this axis (and direction)
            if (mouse.dirAx !== newAx) {
                mouse.distAxX = 0;
                mouse.distAxY = 0;
            } else {
                mouse.distAxX += Math.abs(mouse.distX);
                if (mouse.dirX !== 0 && mouse.dirX !== mouse.lastDirX) {
                    mouse.distAxX = 0;
                }
                mouse.distAxY += Math.abs(mouse.distY);
                if (mouse.dirY !== 0 && mouse.dirY !== mouse.lastDirY) {
                    mouse.distAxY = 0;
                }
            }
            mouse.dirAx = newAx;

            /**
             * move horizontal
             */
            if (mouse.dirAx && mouse.distAxX >= opt.threshold) {
                this._dragMoveHorizontal(mouse, opt);
            }

            var isEmpty = false;
           // this.dragEl_vanilla = dragEl_new;
          
            // find list item under cursor
            if (!hasPointerEvents) {
                this.dragEl.style.visibility = 'hidden';
            }
             this.pointEl = pointEl_vanilla = document.elementFromPoint(
                e.pageX - document.body.scrollLeft,
                 e.pageY - (window.pageYOffset || document.documentElement.scrollTop)
                );
          
            if (!hasPointerEvents) {
                pointEl_vanilla.style.visibility = 'visible';
            }
            if (pointEl_vanilla && pointEl_vanilla.classList.contains(opt.handleClass)) {
               var parentNode = pointEl_vanilla.closest(opt.itemNodeName);
               pointEl_vanilla = parentNode;
                this.pointEl = parentNode; 
                
            }


            if (pointEl_vanilla && pointEl_vanilla.classList.contains(opt.emptyClass)) {
                isEmpty = true;
            }else if (!pointEl_vanilla || !pointEl_vanilla.classList.contains(opt.itemClass)) {
                return;
            }

            // find parent list of item under cursor
            var pointElRoot = this.pointEl.closest('.' + opt.rootClass);
                var isNewRoot = this.dragRootEl.dataset.nestableId !== pointElRoot.dataset.nestableId;
            /**
             * move vertical
             */
            if (!mouse.dirAx || isNewRoot || isEmpty) {
                this._dragMoveVertical(e, mouse, opt, isEmpty, isNewRoot);
            }
        },

        _dragMoveHorizontal: function(mouse, opt) {
            console.log('🔄 dragMoveHorizontal called - distX:', mouse.distX);
            var prev, list, depth, next, parent;
            
            // reset move distance on x-axis for new phase
            mouse.distAxX = 0;
            
            prev = this.placeEl.previousElementSibling;
            if (!prev || !prev.matches(opt.itemNodeName)) {
                return;
            }
        
            // increase horizontal level if previous sibling exists and is not collapsed
            if (mouse.distX > 0 && !prev.classList.contains(opt.collapsedClass)) {
                // cannot increase level when item above is collapsed
                list = prev.querySelector(opt.listNodeName);
                
                depth = this._getDepth(this.placeEl, opt.listNodeName);
                
                if (depth + this.dragDepth <= opt.maxDepth) {
                    // create new sub-level if one doesn't exist
                    if (!list) {
                        list = document.createElement(opt.listNodeName);
                        list.classList.add(opt.listClass);
                        
                        list.appendChild(this.placeEl);
                        
                        prev.appendChild(list);
                        
                        this.setParent(prev);
                    } else {
                        // else append to next level up
                        list = prev.querySelector(opt.listNodeName);
                        
                        list.appendChild(this.placeEl);
                    }
                }
            }
            
            // decrease horizontal level
            if (mouse.distX < 0) {
                // we can't decrease a level if an item preceeds the current one
              
                next = this.placeEl.nextElementSibling;
                if (!next || !next.matches(opt.itemNodeName)) {
                   
                    parent = this.placeEl.parentElement; // Burası placeholder'ın içinde bulunduğu ol/ul listesi olacak
                    
                    // Placeholder'ın içinde bulunduğu listeyi bulalım
                    const currentList = this.placeEl.parentElement;

                    // Bu listenin parent elementini (bir li veya .dd root olabilir) bulalım
                    const parentOfCurrentList = currentList ? currentList.parentElement : null;

                    // Eğer parentOfCurrentList bir li ise, placeholder'ı bu li'nin parent listesine (bir üst seviyedeki ol/ul) taşıyalım
                    if (parentOfCurrentList && parentOfCurrentList.matches(opt.itemNodeName)) {
                         const targetList = parentOfCurrentList.parentElement;
                         if (targetList) {
                             targetList.insertBefore(this.placeEl, parentOfCurrentList.nextSibling);

                             // Eğer orijinal parent list (currentList) boş kaldıysa unsetParent'ı çağır
                             if (!currentList.children.length) {
                                  this.unsetParent(parentOfCurrentList); // parentOfCurrentList burada li
                             }
                         }
                    }
                    // Not: Eğer parentOfCurrentList li değilse (yani root listin içindeysek), daha fazla seviye düşüremeyiz.



                }
            }
        },
        
        
        _getDepth: function(element, nodeName) {
            let depth = 0;
            let current = element;
            while (current) {
                if (current.matches(nodeName)) {
                    depth++;
                }
                current = current.parentElement;
            }
            return depth;
        },

        _dragMoveVertical: function(e, mouse, opt, isEmpty, isNewRoot) {
            console.log('⬆️ dragMoveVertical called - isEmpty:', isEmpty, 'isNewRoot:', isNewRoot);
            var depth, before, parent, list;

            
            const pointElRoot = this.pointEl.closest('.' + opt.rootClass);
             isNewRoot = this.dragRootEl.dataset.nestableGroup !== pointElRoot.dataset.nestableGroup;
            // check if groups match if dragging over new root
            if (isNewRoot && parseInt(pointElRoot.dataset.nestableGroup) !== opt.group) {
                return false;
            }

          
            if (isNewRoot && pointElRoot && parseInt(pointElRoot.dataset.nestableGroup) !== opt.group) {
                 return false;
            }

            // check depth limit
            depth = this.dragDepth - 1 + this._getDepth(this.pointEl, opt.listNodeName);

            if (depth > opt.maxDepth) {
                return false;
            }


            const pointElRect = this.pointEl.getBoundingClientRect();
            before = e.pageY < (pointElRect.top + window.scrollY + pointElRect.height / 2);

            parent = this.placeEl.parentElement;

            // if empty create new list to replace empty placeholder
            if (isEmpty) {
                list = document.createElement(opt.listNodeName);
                list.classList.add(opt.listClass);

                list.appendChild(this.placeEl);

                 if (this.pointEl.parentNode) {
                    this.pointEl.parentNode.replaceChild(list, this.pointEl);
                 }

            } else if (before) {
                if (this.pointEl.parentNode) {
                   this.pointEl.parentNode.insertBefore(this.placeEl, this.pointEl);
                }

            } else {
                 if (this.pointEl.parentNode) {
                    this.pointEl.parentNode.insertBefore(this.placeEl, this.pointEl.nextSibling);
                 }
            }

            // If the parent list (where the placeholder was) is now empty, remove the parent relationship indicators
            if (parent && !parent.children.length) {
                this.unsetParent(parent.parentElement);
            }

            // If the root list (where the drag started) is now empty, add the empty placeholder
            if (!this.dragRootEl.querySelectorAll(opt.itemNodeName).length) {
                 const emptyDiv = document.createElement('div');
                 emptyDiv.classList.add(opt.emptyClass);
                 this.dragRootEl.appendChild(emptyDiv);
            }

            // parent root list has changed
            if (isNewRoot) {
                // jQuery: this.dragRootEl = pointElRoot;
                this.dragRootEl = pointElRoot;
                this.hasNewRoot = this.element !== this.dragRootEl;
            }

            return true;
        },

    };

    // Vanilla JavaScript nestable function
    function nestable(elements, params) {
        var retval = elements;
        
        // Elements'i array'e çevir (NodeList veya HTMLCollection olabilir)
        var elementsArray = Array.from(elements);
        
        elementsArray.forEach(function(element) {
            // Plugin'i element üzerinde saklanan data'dan al
            var plugin = element._nestablePlugin;
            
            if (!plugin) {
                // Yeni plugin instance'ı oluştur ve element'e kaydet
                element._nestablePlugin = new Plugin(element, params);
                element._nestableId = new Date().getTime();
            } else {
                // Eğer params bir string ise ve plugin'de bu metod varsa çağır
                if (typeof params === 'string' && typeof plugin[params] === 'function') {
                    retval = plugin[params]();
                }
            }
        });
        
        return retval || elements;
    }
    
    // Global scope'a nestable function'ını ekle
    window.nestable = nestable;

})(window, document);