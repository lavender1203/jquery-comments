(function($) {

    var Comments = {

        // Instance variables
        // ==================

        $el: null,
        commentsById: {},
        currentSortKey: '',

        options: {
            profilePictureURL: '',
            spinnerImageURL: 'img/ajax-loader.gif',

            // Strings to be formatted (for example localization)
            textareaPlaceholderText: 'Add a comment',
            popularText: 'Popular',
            newestText: 'Newest',
            oldestText: 'Oldest',
            sendText: 'Send',
            likeText: 'Like',
            replyText: 'Reply',
            youText: 'You',
            viewAllRepliesText: 'View all __replyCount__ replies',
            hideRepliesText: 'Hide replies',
            textFormatter: function(text) {
                return text;
            },

            highlightColor: '#1B7FCC',
            roundProfilePictures: false,
            textareaRows: 2,
            textareaRowsOnFocus: 2,
            textareaMaxRows: 5,
            maxRepliesVisible: 2,

            fieldMappings: {
               id: 'id',
               parent: 'parent',
               created: 'created',
               modified: 'modified',
               content: 'content',
               fullname: 'fullname',
               profilePictureURL: 'profile_picture_url',
               createdByAdmin: 'created_by_admin',
               createdByCurrentUser: 'created_by_current_user',
               moderationPending: 'moderation_pending'
            },

            getComments: function(callback) {callback()},
            postComment: function(commentJSON, success, error) {success(commentJSON)},
            refresh: function() {},
            timeFormatter: function(time) {
                return new Date(time).toLocaleDateString();
            },
        },

        events: {
            // Listening changes in contenteditable fields (due to input event not working with IE)
            'focus [contenteditable]' : 'saveEditableContent',
            'keyup [contenteditable]' : 'checkEditableContentForChange',
            'paste [contenteditable]' : 'checkEditableContentForChange',
            'input [contenteditable]' : 'checkEditableContentForChange',
            'blur [contenteditable]' : 'checkEditableContentForChange',

            // Navigation
            'click .navigation li' : 'navigationElementClicked',

            // Main comenting field
            'focus .commenting-field.main .textarea': 'showMainCommentingField',
            'click .commenting-field.main .close' : 'hideMainCommentingField',
            
            // All commenting fields
            'focus .commenting-field .textarea' : 'increaseTextareaHeight',
            'change .commenting-field .textarea' : 'increaseTextareaHeight textareaContentChanged',
            'click .commenting-field .send.enabled' : 'postComment',
            'click .commenting-field:not(.main) .close' : 'removeCommentingField',

            // Comment
            'click li.comment .child-comments .toggle-all': 'toggleReplies',
            'click li.comment .reply': 'replyButtonClicked',
        },


        // Initialization
        // ==============

        init: function(options, el) {
            this.$el = $(el);
            this.$el.addClass('jquery-comments');
            this.undelegateEvents();
            this.delegateEvents();

            // Detect mobile devices
            (function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);
            if($.browser.mobile) this.$el.addClass('mobile');

            // Init options
            var self = this;
            $(Object.keys(options)).each(function(index1, key1) {
                
                var value = options[key1];

                // Expand dictionary
                if(value.constructor == Object) {
                    $(Object.keys(value)).each(function(index2, key2) {
                        self.options[key1][key2] = value[key2];
                    });

                // Override value
                } else {
                    self.options[key1] = value;
                }
            });

            // Create CSS declarations for highlight color
            this.createCssDeclarations();

            // Fetching data and rendering
            this.fetchDataAndRender();
        },

        delegateEvents: function() {
            this.bindEvents(false);
        },

        undelegateEvents: function() {
            this.bindEvents(true);
        },

        bindEvents: function(unbind) {
            var bindFunction = unbind ? 'off' : 'on';
            for (var key in this.events) {
                var eventName = key.split(' ')[0];
                var selector = key.split(' ').slice(1).join(' ');
                var methodNames = this.events[key].split(' ');

                for(var index in methodNames) {
                    var method = this[methodNames[index]];

                    // Keep the context
                    method = $.proxy(method, this);

                    if (selector == '') {
                        this.$el[bindFunction](eventName, method);
                    } else {
                        this.$el[bindFunction](eventName, selector, method);
                    }
                }
            }
        },


        // Basic functionalities
        // =====================

        fetchDataAndRender: function () {
            var self = this;

            this.$el.empty();
            this.createHTML();

            // Get comments
            this.commentsById = {};
            this.options.getComments(function(commentsArray) {
                // Convert comments to custom data model
                var commentModels = commentsArray.map(function(commentsJSON){
                    return self.createCommentModel(commentsJSON)
                });

                // Sort comments by date (oldest first so that they can be appended to the data model
                // without caring dependencies)
                self.sortComments(commentModels, 'oldest');

                $(commentModels).each(function(index, commentModel) {
                    self.addCommentToDataModel(commentModel);
                });

                self.render();
            });
        },

        createCommentModel: function(commentJSON) {
            var commentModel = this.applyInternalMappings(commentJSON);
            commentModel.childs = [];
            return commentModel;
        },

        addCommentToDataModel: function(commentModel) {
            if(!(commentModel.id in this.commentsById)) {
                this.commentsById[commentModel.id] = commentModel;

                // Update child array of the parent (append childs to the array of outer most parent)
                if(commentModel.parent != null) {
                    var parentId = commentModel.parent;
                    do {
                        var parentComment = this.commentsById[parentId];
                        parentId = parentComment.parent;
                    } while(parentComment.parent != null)
                    parentComment.childs.push(commentModel.id);
                }
            }
        },

        render: function() {
            var self = this;

            // Create new comment list
            this.$el.find('#comment-list').remove();
            var commentList = $('<ul/>', {
                id: 'comment-list',
            });

            // Get the sort key from UI
            this.currentSortKey = this.$el.find('.navigation li.active').data().sortKey;

            // Divide commments into main level comments and replies
            var mainLevelComments = [];
            var replies = [];
            $(this.getComments()).each(function(index, commentModel) {
                if(commentModel.parent == null) {
                    mainLevelComments.push(commentModel);
                } else {
                    replies.push(commentModel);
                }
            });

            // Append main level comments
            this.sortComments(mainLevelComments, this.currentSortKey)
            mainLevelComments.reverse();    // Reverse the order as they are prepended to DOM
            $(mainLevelComments).each(function(index, commentModel) {
                self.addComment(commentModel, commentList);
            });

            // Append replies in chronological order
            this.sortComments(replies, 'oldest');
            $(replies).each(function(index, commentModel) {
                self.addComment(commentModel, commentList);
            });

            // Appned comment list to DOM and remove spinner
            this.$el.find('> .spinner').remove();
            this.$el.append(commentList);

            this.options.refresh();
        },

        addComment: function(commentModel, commentList) {
            commentList = commentList || this.$el.find('#comment-list');
            var commentEl = this.createCommentElement(commentModel);

            // Case: reply
            if(commentModel.parent) {
                var directParentEl = commentList.find('.comment[data-id="'+commentModel.parent+'"]');

                // Force replies into one level only
                var outerMostParent = directParentEl.parents('.comment').last();
                if(outerMostParent.length == 0) outerMostParent = directParentEl;

                // Append element to DOM
                var childCommentsEl = outerMostParent.find('.child-comments');
                childCommentsEl.append(commentEl)

                // Update toggle all -button
                this.updateToggleAllButton(outerMostParent);

            // Case: main level comment
            } else {
                commentList.prepend(commentEl);
            }
        },

        updateToggleAllButton: function(parentEl) {
            var childCommentsEl = parentEl.find('.child-comments');
            var childComments = childCommentsEl.find('.comment');
            var toggleAllButton = childCommentsEl.find('li.toggle-all')
            childComments.removeClass('hidden-reply');

            if(childComments.length > this.options.maxRepliesVisible) {
                var hiddenReplies = childComments.slice(0, -this.options.maxRepliesVisible)
                hiddenReplies.addClass('hidden-reply');

                // Show all replies if replies are expanded
                if(toggleAllButton.find('span.text').text() == this.options.textFormatter(this.options.hideRepliesText)) {
                    hiddenReplies.show();
                }

                // Append button to toggle all replies if necessary
                if(!toggleAllButton.length) {

                    toggleAllButton = $('<li/>', {
                        class: 'toggle-all highlight-font',
                    });
                    var toggleAllButtonText = $('<span/>', {
                        class: 'text'
                    });
                    var caret = $('<span/>', {
                        class: 'caret',
                    });

                    // Append toggle button to DOM
                    toggleAllButton.append(toggleAllButtonText).append(caret)
                    childCommentsEl.prepend(toggleAllButton);
                }

                // Update the text of toggle all -button
                this.setToggleAllButtonText(toggleAllButton, false);
            }

        },

        sortComments: function (comments, sortKey) {
            var self = this;

            // Sort by popularity
            if(sortKey == 'popularity') {
                comments.sort(function(commentA, commentB) {
                    var childsOfA = self.commentsById[commentA.id].childs.length;
                    var childsOfB = self.commentsById[commentB.id].childs.length;

                    if(childsOfB != childsOfA) {
                        return childsOfB - childsOfA;

                    // Return newer if popularity is the same
                    } else {
                        var createdA = new Date(commentA.created).getTime();
                        var createdB = new Date(commentB.created).getTime();
                        return createdB - createdA;
                    }
                });

            // Sort by date
            } else {
                comments.sort(function(commentA, commentB) {
                    var createdA = new Date(commentA.created).getTime();
                    var createdB = new Date(commentB.created).getTime();
                    if(sortKey == 'newest') {
                        return createdB - createdA;
                    } else {
                        return createdA - createdB;
                    }
                });
            }
        },

        sortAndReArrangeComments: function(sortKey) {
            var commentList = this.$el.find('#comment-list');
            
            // Get main level comments
            var mainLevelComments = this.getComments().filter(function(commentModel){return !commentModel.parent});
            this.sortComments(mainLevelComments, sortKey);

            // Rearrange the main level comments
            $(mainLevelComments).each(function(index, commentModel) {
                var commentEl = commentList.find('> li.comment[data-id='+commentModel.id+']');
                commentList.append(commentEl);
            });
        },

        editComment: function() {
        },


        // Event handlers
        // ==============

        saveEditableContent: function(ev) {
            var el = $(ev.currentTarget);
            el.data('before', el.html());
        },

        checkEditableContentForChange: function(ev) {
            var el = $(ev.currentTarget);
            if (el.data('before') != el.html()) {
                el.data('before', el.html());
                el.trigger('change');
            }
        },

        navigationElementClicked: function(ev) {
            var navigationEl = $(ev.currentTarget);

            // Indicate active sort
            navigationEl.siblings().removeClass('active');
            navigationEl.addClass('active');

            // Sort the comments
            var sortKey = navigationEl.data().sortKey;
            this.sortAndReArrangeComments(sortKey);

            // Save the current sort key
            this.currentSortKey = sortKey;
        },

        showMainCommentingField: function(ev) {
            var mainTextarea = $(ev.currentTarget);
            mainTextarea.siblings('.control-row').show();
            mainTextarea.parent().find('.close').show();
        },

        hideMainCommentingField: function(ev) {
            var closeButton = $(ev.currentTarget);
            var mainTextarea = this.$el.find('.commenting-field.main .textarea');
            var mainControlRow = this.$el.find('.commenting-field.main .control-row');

            this.clearTextarea(mainTextarea);
            this.adjustTextareaHeight(mainTextarea, false);

            mainControlRow.hide();
            closeButton.hide();
        },

        increaseTextareaHeight: function(ev) {
            var textarea = $(ev.currentTarget);
            this.adjustTextareaHeight(textarea, true);
        },

        textareaContentChanged: function(ev) {
            var textarea = $(ev.currentTarget);
            var content = textarea.text();
            var sendButton = textarea.siblings('.control-row').find('.send');

            // Check whether send button needs to be enabled
            if(content.trim().length) {
                sendButton.addClass('enabled');
            } else {
                sendButton.removeClass('enabled');
            }

            // Remove reply-to badge if necessary
            if(!content.length) {
                textarea.empty();
                textarea.attr('data-parent', textarea.parents('li.comment').data('id'));
            }

            // Move close button if scrollbar is visible
            var commentingField = textarea.parents('.commenting-field').first();
            if(textarea[0].scrollHeight > textarea.outerHeight()) {
                commentingField.addClass('scrollable');
            } else {
                commentingField.removeClass('scrollable');
            }
        },

        postComment: function(ev) {
            var self = this;
            var sendButton = $(ev.currentTarget);
            var commentingField = sendButton.parents('.commenting-field').first();
            var textarea = commentingField.find('.textarea');

            // Disable send button while request is pending
            sendButton.removeClass('enabled');

            var time = new Date().getTime();
            var commentJSON = {                    
                id: 'c' +  (this.getComments().length + 1),   // Temporary id
                parent: textarea.attr('data-parent') || null,
                created: time,
                modified: time,
                content: this.getTextareaContent(textarea),
                fullname: this.options.textFormatter(this.options.youText),
                profilePictureURL: this.options.profilePictureURL,
                createdByCurrentUser: true,
            }

            // Reverse mapping
            commentJSON = this.applyExternalMappings(commentJSON);
            
            var success = function(commentJSON) {
                var commentModel = self.createCommentModel(commentJSON);
                self.addCommentToDataModel(commentModel);
                self.addComment(commentModel);
                commentingField.find('.close').trigger('click');
            }

            var error = function() {
                sendButton.addClass('enabled');
            }

            this.options.postComment(commentJSON, success, error);
        },

        removeCommentingField: function(ev) {
            var commentingField = $(ev.currentTarget).parents('.commenting-field').first();
            commentingField.remove();
        },

        toggleReplies: function(ev) {
            var el = $(ev.currentTarget);
            el.siblings('.hidden-reply').toggle();
            this.setToggleAllButtonText(el, true);
        },

        replyButtonClicked: function(ev) {
            var replyButton = $(ev.currentTarget);
            var outermostParent = replyButton.parents('li.comment').last();
            var parentId = replyButton.parents('.comment').first().data().id;


            // Remove existing field
            var replyField = outermostParent.find('.commenting-field');
            if(replyField.length) replyField.remove();
            var previousParentId = parseInt(replyField.find('.textarea').attr('data-parent'));

            // Create the reply field (do not re-create)
            if(previousParentId != parentId) {            
                var replyField = this.createCommentingFieldElement();
                outermostParent.children().last().append(replyField);
                textarea = replyField.find('.textarea');

                // Set the correct parent id to the field
                textarea.attr('data-parent', parentId);

                // Append reply-to badge if necessary
                var parentModel = this.commentsById[parentId];
                if(parentModel.parent) {
                    textarea.html('&nbsp;');    // Needed to set the cursor to correct place

                    // Creating the reply-to badge
                    var replyToBadge = $('<input/>', {
                        class: 'reply-to-badge highlight-font',
                        type: 'button'
                    });
                    var replyToName = '@' + parentModel.fullname;
                    replyToBadge.val(replyToName);
                    textarea.prepend(replyToBadge);

                    // Move cursor to the end
                    var range = document.createRange();
                    var selection = window.getSelection();
                    range.setStart(textarea[0], 2);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                
                textarea.focus();
            }

        },


        // HTML elements
        // =============

        createHTML: function() {
            var self = this;

            // Commenting field
            var mainCommentingField = this.createCommentingFieldElement();
            mainCommentingField.addClass('main');
            this.$el.append(mainCommentingField);

            // Hide control row and close button
            var mainControlRow = mainCommentingField.find('.control-row');
            mainControlRow.hide();
            mainCommentingField.find('.close').hide();

            // Navigation bar
            this.$el.append(this.createNavigationElement());


            // Loading spinner
            var spinner = $('<img/>', {
                class: 'spinner',
                src: this.options.spinnerImageURL,
            });

            this.$el.append(spinner);
        },

        createProfilePictureElement: function(src) {
            var profilePicture = $('<img/>', {
                src: src,
                class: 'profile-picture' + (this.options.roundProfilePictures ? ' round' : '')
            });
            return profilePicture;
        },

        createCommentingFieldElement: function() {
            var self = this;

            // Commenting field
            var commentingField = $('<div/>', {
                class: 'commenting-field',
            });

            // Profile picture
            var profilePicture = this.createProfilePictureElement(this.options.profilePictureURL);
            profilePicture.addClass('by-current-user');

            // New comment
            var textareaWrapper = $('<div/>', {
                class: 'textarea-wrapper',
            });
        
            // Control row
            var controlRow = $('<div/>', {
                class: 'control-row',
            });

            // Textarea
            var textarea = $('<div/>', {
                class: 'textarea',
                'data-placeholder': this.options.textFormatter(this.options.textareaPlaceholderText),
                contenteditable: true,
            });

            // Setting the initial height for the textarea
            this.adjustTextareaHeight(textarea, false);
            
            // Close button
            var closeButton = $('<span/>', {
                class: 'close',
            }).append($('<span class="left"/>')).append($('<span class="right"/>'));

            // Send button
            var sendButton = $('<span/>', {
                class: 'send highlight-background',
                text: this.options.textFormatter(this.options.sendText),
            });

            controlRow.append(sendButton);
            textareaWrapper.append(closeButton).append(textarea).append(controlRow);
            commentingField.append(profilePicture).append(textareaWrapper);
            return commentingField;
        },

        createNavigationElement: function() {
            var navigationEl = $('<ul/>', {
                class: 'navigation'
            });

            // Popular
            var popular = $('<li/>', {
                text: this.options.textFormatter(this.options.popularText),
                'data-sort-key': 'popularity',
                 class: 'active',
            });
            
            // Newest
            var newest = $('<li/>', {
                text: this.options.textFormatter(this.options.newestText),
                 'data-sort-key': 'newest',
            });

            // Oldest
            var oldest = $('<li/>', {
                text: this.options.textFormatter(this.options.oldestText),
                 'data-sort-key': 'oldest',
            });

            navigationEl.append(popular).append(newest).append(oldest);
            return navigationEl;
        },

        createCommentElement: function(commentModel) {

            // Comment container element
            var commentEl = $('<li/>', {
                'data-id': commentModel.id,
                class: 'comment',
            }).data('model', commentModel);

            if(commentModel.createdByCurrentUser) commentEl.addClass('by-current-user');
            if(commentModel.createdByAdmin) commentEl.addClass('by-admin');

            var commentWrapper = $('<div/>', {
                class: 'comment-wrapper'
            });

            // Profile picture
            var profilePicture = this.createProfilePictureElement(commentModel.profilePictureURL);

            // Time
            var time = $('<time/>', {
                text: this.options.timeFormatter(commentModel.created)
            });

            // Name
            var name = $('<div/>', {
                class: 'name',
                text: commentModel.fullname,
            });

            // Highlight name for admins
            if(commentModel.createdByAdmin) name.addClass('highlight-font');

            // Show reply-to name if parent of parent exists
            if(commentModel.parent) {
                var parent = this.commentsById[commentModel.parent];
                if(parent.parent) {
                    var replyTo = $('<span/>', {
                        class: 'reply-to',
                        text: ' @' + parent.fullname,
                    });
                    name.append(replyTo);
                }
            }

            // Wrapper
            var wrapper = $('<div/>', {
                class: 'wrapper',
            });

            // Content
            var content = $('<div/>', {
                class: 'content',
                text: commentModel.content,
            });

            // Like
            var like = $('<span/>', {
                class: 'like',
                text: this.options.textFormatter(this.options.likeText),
            });

            // Reply
            var reply = $('<span/>', {
                class: 'reply',
                text: this.options.textFormatter(this.options.replyText),
            })

            var otherContent = $('<div/>', {
                class: 'other-content',
            });

            // Child comments
            var childComments = $('<ul/>', {
                class: 'child-comments'
            });
            
            wrapper.append(content);
            wrapper.append(like).append(reply)
            commentWrapper.append(profilePicture).append(time).append(name).append(wrapper);

            commentEl.append(commentWrapper).append(otherContent);
            if(commentModel.parent == null) otherContent.append(childComments);
            return commentEl;
        },


        // Styling
        // =======

        createCssDeclarations: function() {

            // Do not recreate CSS declarations
            if($('head style.jquery-comments-css').length > 0) return;

            // Navigation underline
            this.createCss('.jquery-comments ul.navigation li.active:after {background: '
                + this.options.highlightColor  + ' !important;',
                +'}');

            // Background highlight
            this.createCss('.jquery-comments .highlight-background {background: '
                + this.options.highlightColor  + ' !important;',
                +'}');

            // Font highlight
            this.createCss('.jquery-comments .highlight-font {color: '
                + this.options.highlightColor + ' !important;'
                + 'font-weight: bold;'
                +'}');
        },

        createCss: function(css) {
            var styleEl = $('<style/>', {
                type: 'text/css',
                class: 'jquery-comments-css',
                text: css,
            });
            $('head').append(styleEl);
        },


        // Utilities
        // =========

        getComments: function() {
            var self = this;
            return Object.keys(this.commentsById).map(function(id){return self.commentsById[id]});
        },

        setToggleAllButtonText: function(toggleAllButton, toggle) {
            var self = this;
            var textContainer = toggleAllButton.find('span.text');
            var caret = toggleAllButton.find('.caret');

            var showExpandingText = function() {
                var text = self.options.textFormatter(self.options.viewAllRepliesText);
                var replyCount = toggleAllButton.siblings('.comment').length;
                text = text.replace('__replyCount__', replyCount);
                textContainer.text(text);
            }

            var hideRepliesText = this.options.textFormatter(this.options.hideRepliesText);

            if(toggle) {

                // Toggle text
                if(textContainer.text() == hideRepliesText) {
                    showExpandingText();
                } else {
                    textContainer.text(hideRepliesText);
                }
                // Toggle direction of the caret
                caret.toggleClass('up');

            } else {

                // Update text if necessary
                if(textContainer.text() != hideRepliesText) {
                    showExpandingText();
                }
            }
        },

        adjustTextareaHeight: function(textarea, focus) {
            var textareaBaseHeight = 2.2;
            var lineHeight = 1.45;

            var setRows = function(rows) {
                var height = textareaBaseHeight + (rows - 1) * lineHeight;
                textarea.css('height', height + 'em');
            }

            var textarea = $(textarea);
            var rowCount = focus == true ? this.options.textareaRowsOnFocus : this.options.textareaRows;
            do {
                setRows(rowCount);
                rowCount++;
                var isAreaScrollable = textarea[0].scrollHeight > textarea.outerHeight();
            } while(isAreaScrollable && rowCount <= this.options.textareaMaxRows);
        },

        clearTextarea: function(textarea) {
            textarea.empty().trigger('input');
        },

        getTextareaContent: function(textarea) {
            var ce = $('<pre/>').html(textarea.html());
            ce.find('div, p, br').replaceWith(function() { return '\n' + this.innerHTML; });
            return ce.text().trim();
        },

        applyInternalMappings: function(commentJSON) {

            // Inverting field mappings
            var invertedMappings = {};
            var mappings = this.options.fieldMappings;
            for (var prop in mappings) {
                if(mappings.hasOwnProperty(prop)) {
                    invertedMappings[mappings[prop]] = prop;
                }
            }

            return this.applyMappings(invertedMappings, commentJSON);
        },

        applyExternalMappings: function(commentJSON) {
            var mappings = this.options.fieldMappings;
            return this.applyMappings(mappings, commentJSON);
        },

        applyMappings: function(mappings, commentJSON) {
            var result = {};

            for(var key1 in commentJSON) {
                if(key1 in mappings) {
                    var key2 = mappings[key1];
                    result[key2] = commentJSON[key1];
                }
            }
            return result;
        },

    }

    $.fn.comments = function(options) {
        return this.each(function() {
            var comments = Object.create(Comments);
            comments.init(options || {}, this);
            $.data(this, 'comments', comments);
        });
    };

})(jQuery);
