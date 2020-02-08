// Uncomment the below line to test display name
// localStorage.removeItem("displayName");

document.addEventListener("DOMContentLoaded", function() {

    var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);
    socket.on("connect", function() {

        window.addEventListener("load", function() {

            // Display Name
            if (!localStorage.getItem("displayName")) {

                $("#nameModal").on("shown.bs.modal", function() {
                    document.querySelector("#display-name").focus();
                    var forms = document.getElementsByClassName("needs-validation");
                    var validation = Array.prototype.filter.call(forms, function(form) {
                        form.addEventListener("submit", function(event) {
                            event.preventDefault();
                            event.stopPropagation();
                            if (form.checkValidity() === true) {
                                const displayName = form.displayName.value;
                                localStorage.setItem("displayName", displayName);
                                document.querySelector("#current-display-name").innerHTML = `Display Name: @${displayName}`;
                                $("#nameModal").modal("hide");
                            }
                            form.classList.add("was-validated");
                        });
                    });
                });

                $("#nameModal").on("hidden.bs.modal", function(event) {
                    document.querySelector("#message-text").focus();
                });

                $("#nameModal").modal({backdrop: "static"});

            }
            else {
                document.querySelector("#current-display-name").innerHTML = `Display Name: @${localStorage.getItem("displayName")}`;
            }

            // Channel Creation
            $("#channelModal").on("shown.bs.modal", function() {
                document.querySelector("#channel-name").focus();
                var forms = document.getElementsByClassName("needs-validation");
                var validation = Array.prototype.filter.call(forms, function(form) {

                    form.addEventListener("keyup", function(event) {
                        if (form.channelName.value.length > 0) {
                            $.get("/check?channel_name=" + form.channelName.value, function(data) {
                                if (data) {
                                    document.querySelector("#invalid-channel-name").innerHTML = "";
                                    form.channelName.setCustomValidity("");
                                }
                                else {
                                    document.querySelector("#invalid-channel-name").innerHTML = "Channel already exists.";
                                    form.channelName.setCustomValidity("invalid");
                                }
                            });
                        }
                        else {
                            document.querySelector("#invalid-channel-name").innerHTML = "Channel name may not be blank.";
                        }
                    });

                    form.addEventListener("submit", function(event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        if (form.checkValidity() === true) {
                            const channelName = form.channelName.value;
                            socket.emit("create channel", {"channel_name": channelName});
                            $("#channelModal").modal("hide");
                        }
                        form.classList.add("was-validated");
                    });

                });
            });

            $("#channelModal").on("hidden.bs.modal", function(event) {
                event.stopImmediatePropagation();
                const form = document.querySelector("#channel-form");
                if (form.classList.contains("was-validated")) {
                    const channel = document.querySelector(".channel:last-child");
                    channel.scrollIntoView();
                    switch_to_channel(channel);
                    form.classList.remove("was-validated");
                }
                document.querySelector("#channel-name").value = "";
                document.querySelector("#message-text").focus();
            });

        });

        // Channel List
        function add_onclick_to_channels() {
            document.querySelectorAll(".channel").forEach(function(channel) {
                channel.onclick = function() {
                    switch_to_channel(channel);
                    return false;
                };
            });
        }

        add_onclick_to_channels();

        const channelTemplate = Handlebars.compile(document.querySelector("#channel-nav").innerHTML);
        socket.on("channel created", function(data) {
            const channel = channelTemplate({"channelId": data.channel.id, "channelName": data.channel.name});
            document.querySelector("#channel-list").innerHTML += channel;
            add_onclick_to_channels();
        });

        $('#nav').on('shown.bs.collapse', function () {
            document.addEventListener("click", function(event) {
                nav = document.querySelector("#overlay");
                if (overlay === event.target) {
                    $('#nav').collapse("hide");
                }
            });
        });

        // Messages View
        var counter = 0;
        const quantity = 20;
        const messageTemplate = Handlebars.compile(document.querySelector("#message").innerHTML);
        function add_messages_to_channel(channel) {
            const channelId = channel.dataset.channelId;
            const start = counter;
            const end = start + quantity;
            counter = end;

            const request = new XMLHttpRequest();
            request.open("POST", "/get_messages");
            request.onload = function() {
                const data = JSON.parse(request.responseText);
                if (data) {

                    const messages = document.querySelector("#messages");
                    const displayName = localStorage.getItem("displayName");

                    data.messages.forEach(function(message) {
                        var close = false;
                        if (message.display_name === displayName) {
                            close = true;
                        }
                        message.text = message.text.replace(/\n/g, "<br>");
                        message = messageTemplate({"id": message.id, "displayName": message.display_name, "timestamp": message.timestamp, "text": message.text, "close": close});
                        messages.innerHTML = message + messages.innerHTML;
                        message = document.querySelector(".message");
                        messages.parentElement.scrollTop += message.scrollHeight + 1;
                    });

                    if (data.first) {
                        const channelName = channel.dataset.channelName;
                        var firstMessage = `<li class="message list-group-item pb-0" data-first="true"><h6 class="card-title">Welcome to the beginning of the <b>#${channelName}</b> channel.</h6></li>`;
                        messages.innerHTML = firstMessage + messages.innerHTML;
                        firstMessage = document.querySelector(".message");
                        messages.parentElement.scrollTop += firstMessage.scrollHeight + 1;
                    }

                    add_onclick_to_del_buttons();

                }
                else {
                    channel = document.querySelector(".channel");
                    channel.scrollIntoView();
                    switch_to_channel(channel);
                }
            };
            const data = new FormData();
            data.append("channel_id", channelId);
            data.append("start", start);
            data.append("end", end);
            request.send(data);
        }

        function switch_to_channel(channel) {
            $('#nav').collapse("hide");

            const prevChannelId = localStorage.getItem("channelId");
            const prevChannel = document.querySelector(`#channel-${prevChannelId}`);
            if (prevChannel) {
                prevChannel.classList.remove("active");
                prevChannel.classList.remove("btn-outline-success");
                prevChannel.classList.add("btn-outline-secondary");
            }

            if (!channel) {
                channel = document.querySelector(".channel");
            }
            channel.classList.remove("btn-outline-secondary");
            channel.classList.add("btn-outline-success");
            channel.classList.add("active");

            const channelName = channel.dataset.channelName;
            document.title = `#${channelName}`;

            const headerTemplate = Handlebars.compile(document.querySelector("#channel-title").innerHTML);
            const channelHeader = headerTemplate({"channelName": channelName});
            console.log(channelHeader);
            document.querySelector("#channel-header").innerHTML = channelHeader;

            counter = 0;
            const messages = document.querySelector("#messages");
            messages.innerHTML = "";
            add_messages_to_channel(channel);
            messages.parentElement.onscroll = function() {
                if (!document.querySelector(".message").dataset.first && messages.parentElement.scrollTop <= 0) {
                    add_messages_to_channel(channel);
                }
            };

            const messageText = document.querySelector("#message-text");
            messageText.value = "";
            messageText.placeholder = `Message #${channelName}`;
            messageText.style.height = "36px";
            messageText.focus();

            const channelId = channel.dataset.channelId;
            history.pushState({"channelId": channelId}, `#${channelName}`, channelId);
            localStorage.setItem("channelId", channelId);
        }

        window.onpopstate = function(event) {
            const data = event.state;
            const channel = document.querySelector(`#channel-${data.channelId}`);
            switch_to_channel(channel);
        };

        // Sending Messages
        document.querySelector("#message-text").onkeydown = function(event) {
            if (event.which === 13) {
                event.stopPropagation();
                if (!event.shiftKey) {
                    event.preventDefault();
                    const messageText = document.querySelector("#message-text");
                    const text = messageText.value.trim();
                    if (text.length > 0) {
                        const channelId = localStorage.getItem("channelId");
                        const displayName = localStorage.getItem("displayName");
                        messageText.value = "";
                        messageText.style.height = "36px";
                        socket.emit("send message", {"channel_id": channelId, "display_name": displayName, "text": text});
                    }
                }
            }
        };

        document.querySelector("#message-text").onkeyup = function(event) {
            const messageText = document.querySelector("#message-text");
            messageText.style.height = "0";
            messageText.style.height = messageText.scrollHeight + "px";
        };

        socket.on("message sent", function(data) {
            if (localStorage.getItem("channelId") === data.channel_id) {
                var close = false;
                if (data.message.display_name === localStorage.getItem("displayName")) {
                    close = true;
                }
                const text = data.message.text.replace(/\n/g, "<br>");
                var message = messageTemplate({"id": data.message.id, "displayName": data.message.display_name, "timestamp": data.message.timestamp, "text": text, "close": close});
                const messages = document.querySelector("#messages");
                messages.innerHTML += message;
                add_onclick_to_del_buttons();
                message = document.querySelector(".message:last-child");
                if (messages.parentElement.scrollTop >= messages.parentElement.scrollHeight - messages.parentElement.clientHeight - message.scrollHeight - 16) {
                    message.scrollIntoView();
                }
            }
        });

        // Remembering the Channel
        var cachedChannelId = localStorage.getItem("channelId");
        if (typeof channelId !== "undefined") {
            cachedChannelId = channelId;
        }
        var cachedChannel = document.querySelector(`#channel-${cachedChannelId}`);
        switch_to_channel(cachedChannel);

        // Deleting one’s own messages
        function add_onclick_to_del_buttons() {
            document.querySelectorAll(".del").forEach(function(button) {
                button.onclick = function() {
                    const channelId = localStorage.getItem("channelId");
                    const messageId = this.parentElement.dataset.messageId;
                    socket.emit("delete message", {"channel_id": channelId, "message_id": messageId});
                };
            });
        }

        socket.on("message deleted", function(data) {
            if (localStorage.getItem("channelId") === data.channel_id) {
                const message = document.querySelector(`#message-${data.message_id}`)
                message.style.animationPlayState = 'running';
                message.addEventListener('animationend', function() {
                    message.remove();
                });
            }
        });

    });
})
