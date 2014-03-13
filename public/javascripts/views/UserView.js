
var UserView = Backbone.View.extend({

  tagName:
  'li',

  className: "online_user",

  template: _.template("<a><img src=<%= gravatarURL %> /></a>"),

  events: {
    "click": "openChatWindow"
  },

  initialize: function(){
    var that = this;
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model, "destroy", this.remove);
    window.app.server.on('message', function(data){
      if ( data.sender === that.model.attributes.gravatarURL ){
        var chat_open = false;
        window.openChats.each(function(chat_window){
          if (chat_window.attributes.partnerObject.attributes.gravatarURL === data.sender){
            chat_open = true;
          }
        });
        if (!chat_open){
          var new_convo = that.openChatWindow();
          new_convo.$('.top-bar').addClass('new-message');
          new_convo.$('.discussion').toggle();
          new_convo.collection.add({ sender: data.sender, content: data.msg });
        }
      }
    });
  },

  render: function(){
    this.$el.html(this.template(this.model.attributes));
  },

  openChatWindow: function(){
    if ( window.openChats.where({gravatarURL: this.model.attributes.gravatarURL}).length < 1 ){
      var chatWindow = new ChatRoom({selfObject: self, partnerObject: this.model });
      openChats.add(chatWindow);
      return new ConversationView({model: chatWindow, collection: new Conversation() });
    }
  }
});
