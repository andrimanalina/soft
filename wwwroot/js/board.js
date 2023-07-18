const connection = new signalR.HubConnectionBuilder()
    .withUrl("/signalrserver")
    .withAutomaticReconnect()
    .build();
async function start() {
    try {
        await connection.start();
        console.assert(connection.state === signalR.HubConnectionState.Connected);
        console.log("Client Connected.");
    } catch (err) {
        console.assert(connection.state === signalR.HubConnectionState.Disconnected);
        console.log(err);
        setTimeout(() => start(), 5000);
    }
};

$(() => {
    start();

    connection.onreconnecting(error => {
        console.assert(connection.state === signalR.HubConnectionState.Reconnecting);

        document.getElementById("messageInput").disabled = true;

        const li = document.createElement("li");
        li.textContent = `Connection lost due to error "${error}". Reconnecting.`;
        document.getElementById("messageList").appendChild(li);
    });

    connection.onreconnected(connectionId => {
        console.assert(connection.state === signalR.HubConnectionState.Connected);

        document.getElementById("messageInput").disabled = false;

        const li = document.createElement("li");
        li.textContent = `Connection reestablished. Connected with connectionId "${connectionId}".`;
        document.getElementById("messageList").appendChild(li);
    });
});

let BoardId = "";

$(document).ready(() => {
    let BoardUrl = window.location.href;
    BoardId = BoardUrl.split("/").pop();

    $("#state-add").hide();

    GetState();
    GetMember();

});

//#region menu
//Favoris
//$(document).on('click', '[data-name="b-favoris"]', (e) => {
$(document).on('click', '[board-favoris]', (e) => {
    let favoris = $(e.target).closest(`i`);
    let boardName = $(e.target).closest(`div.row`).find('[data-name="b-title"]').text();

    let isFavoris = favoris.hasClass("text-muted");
    //Goto Back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("boardId", BoardId);
    formData.append("isFavoris", isFavoris);

    $.ajax({
        type: "POST",
        url: Origin + "Board/UpdateFavoris",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            States = JSON.parse(result);
            if (States.type == "login") {
                window.location = "../";
                return;
            }
            if (States.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: States.msg
                });
                return;
            }

            if (isFavoris) {
                favoris.removeClass("text-muted");
                favoris.addClass("text-warning");
                Toast.fire({
                    icon: 'info',
                    title: `Vous suivez : "${boardName}"`
                });
            } else {
                favoris.removeClass("text-warning");
                favoris.addClass("text-muted");
                Toast.fire({
                    icon: 'info',
                    title: `Vous ne suivez plus : "${boardName}"`
                });
            }

        },

        Error: function (x, e) {
            Toast.fire({
                icon: 'error',
                title: e
            });
        }
    });

});

//Membre
$(document).on('click', '[board-member-add]', (e) => {
    let header = $(e.target).closest(`[board-member]`);
    let memberInput = header.find("[board-member-add-name]");
    let newmember = memberInput.val();

    let list = header.find("[board-member-list]");
    let toplist = header.find("[board-member-top-list]");

    //Goto Back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("boardId", BoardId);
    formData.append("member", newmember);

    $.ajax({
        type: "POST",
        url: Origin + "Board/AddUserBoard",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }

            let code = `
                <li class="list-group-item d-flex justify-content-evenly" member-id="${Datas.data.Id}">
                    <div class="col d-flex justify-content-evenly">
                        <div class="imgbox text-bold" member-abbr>${Datas.data.Abbr}</div>
                        <div>
                            <div member-name>${Datas.data.Name}</div>
                            <div class="small" member-mail>${Datas.data.Mail}</div>
                        </div>
                    </div>
                    <select class="form-control col-4" member-role title="Rôle">
                        <option value="0">Membre</option>
                        <option value="1">Développeur</option>
                        <option value="2">Client</option>
                        <option value="3">Observateur</option>
                    </select>
                </li>
            `;

            toplist.after(code);

            Toast.fire({
                icon: 'success',
                title: `Ajout Membre réussi`
            });

        },

        Error: function (x, e) {
            Toast.fire({
                icon: 'error',
                title: e
            });
        }
    });

});

function GetMember() {
    let header = $(`[board-member]`);
    let memberInput = header.find("[board-member-add-name]");
    let newmember = memberInput.val();

    let list = header.find("[board-member-list]");
    let toplist = header.find("[board-member-top-list]");

    //Goto Back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("boardId", BoardId);

    $.ajax({
        type: "POST",
        url: Origin + "Board/GetUserBoard",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }
            let code = ``;
            $.each(Datas.data, (k, v) => {
                code = `
                    <li class="list-group-item d-flex justify-content-evenly" member-id="${v.Id}">
                        <div class="col d-flex justify-content-evenly">
                            <div class="imgbox text-bold" member-abbr>${v.Abbr}</div>
                            <div>
                                <div member-name>${v.Name}</div>
                                <div class="small" member-mail>${v.Mail}</div>
                            </div>
                        </div>
                        <select class="form-control col-4" member-role title="Rôle">
                            <option value="0">Membre</option>
                            <option value="1">Développeur</option>
                            <option value="2">Client</option>
                            <option value="3">Observateur</option>
                        </select>
                    </li>
                `;
                toplist.after(code);
                $(`[member-id="${v.Id}"]`).find(`select`).val(v.Role).change();
            });

        },

        Error: function (x, e) {
            Toast.fire({
                icon: 'error',
                title: e
            });
        }
    });
}
//#endregion

//#region board
function GetState() {
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("boardId", BoardId);
    
    $.ajax({
        type: "POST",
        url: Origin + "State/GetState",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                User = null;
                window.location = Origin;
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                window.location = Origin + `/Workspace`;
            }
            let Boards = Datas.data;
            $(`[board-title]`).text(Boards.Name);
            $(`[board-id]`).attr("board-id", BoardId);

            switch (Boards.Visibility) {
                case 0:
                    $(`[board-visibility]`).html(`<i class="fa fa-globe"></i> <div class="d-none d-sm-inline">Public</div>`);
                    break;
                case 1:
                    $(`[board-visibility]`).html(`<i class="fa fa-lock"></i> <div class="d-none d-sm-inline">Private</div>`);
                    break;
                case 2:
                    $(`[board-visibility]`).html(`<i class="fa fa-building"></i> <div class="d-none d-sm-inline">Espace de travail</div>`);
                    break;
                default: return;
            }

            $(`[board-favoris]`).addClass(Boards.isFavoris ? "text-warning" : "text-muted");

            let code = ``;
            //List States
            $.each(Boards.States, (k, state) => {
                code += `
                    <div class="card card-row card-default sort Trello-State" state-id="${state.Id}" state-position="${state.Position}">
                        <div class="card-header bg-info display-dropdown">
                            <input type="text" class="form-control" state-input style="display:none"/>
                            <div class="display-dropdown" state-name>
                                <h3 class="card-title">${state.Name}</h3>
                                <div class="dropdown float-right">
                                    <div class="" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fa fa-ellipsis-h p-1"></i>
                                    </div>
                                    <div class="dropdown-menu" style="padding: 5px;cursor:pointer">
                                        <div class="dropdown-item text-warning" state-update><i class="fa fa-pen"></i> Modifier</div>
                                        <div class="dropdown-item text-danger" state-delete><i class="fa fa-trash"></i> Supprimer</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-body" card-list>`;
                //List Card
                $.each(state.Cards, (kc, card) => {
                    let status = "";
                    //
                    code += `
                            <div class="card ${status} card-outline" card-id="${card.Id}" card-name="${card.Name}" card>
                                <div class="card-header" card-detail data-toggle="modal" data-target="#modal-card-${card.Id}">
                                    <h5 class="card-title">${card.Name}</h5>
                                    <div class="card-tools">
                                        <div class="btn btn-tool btn-link">#${card.Position}</div>
                                        
                                    </div>
                                </div>`;
                    if (card.Description || card.Date || card.Comments > 0) {
                        code += `
                                <div class="card-body ">
                                    ${card.Description ? `<i class="fa fa-info-circle ml-1 mr-1" data-toggle="tooltip" data-placement="bottom" title="Cette tâche comprend une description"></i>` : ``}
                                    ${card.Date ? `<i class="far fa-clock ml-1 mr-1" data-toggle="tooltip" data-placement="bottom" title="Cette tâche comprend une date"></i>` : ``}
                                    ${card.Comments == 0 ? `<i class="far fa-comment-alt ml-1 mr-1" data-toggle="tooltip" data-placement="bottom" title="Cette tâche comprend ${card.Comments} commentaires"></i> ${card.Comments}` : ``}
                                </div>`;

                    }
                    code += `
                            </div>`;

                });

                code += `
                        </div>
                `;
                //create card
                code += `
                        <div class="card card-transparent" card-new>
                            <div class="card-header" card-plus>
                                <h3 class="card-title">
                                    <i class="fa fa-plus"></i> Ajouter une tâche
                                </h3>
                            </div>
                            <div card-title style="display:none">
                                <div class="card-header inputAddList">
                                    <input type="text" class="card-title form-control" card-input placeholder="Saisissez le nom de la tâche..." />
                                </div>
                                <div class="card-body d-flex">
                                    <div class="btn btn-primary col-6 ml-1" card-add>Ajouter</div>
                                    <i class="fa fa-times col-2 cancelList" card-cancel></i>
                                </div>
                            </div>
                        </div>
                `;

                code += `
                    </div>
                `;

            });


            $(`#state-new`).before(code);

            //sortable
            Sortable.create($("#state-new")[0], {
                sort: false,
                disabled: false,
            });
            $.each($("[board-id]"), (k, v) => {
                sortableOptionState(k, v);
            });

            $.each($("[card-list]"), (k, v) => {
                console.log(v);
                console.log(sortableOptionCard(k, v));
            });


        },

        Error: function (x, e) {
            alert("Some error");
            //loading(false);
        }
    });
}

function getArrayOfPictures() {
    var items = $('#items')[0].childNodes //change this to wherever the list of images are stored
    return Object.keys(items) //returns an array of each KEY of ITEMS
        .filter(a => items[a].tagName == "IMG") //returns ONLY the image elements
        .map(a => {
            var arr = items[a].src.split('/')
            return arr[arr.length - 1]
        }) //formats it to have just the name of the img after the last '/'
    //stores data how you would like it(and when the order changes everytime you run this function it would return the ordering of it as well)
}

$(document).on('click', '[board-vstat]', (e) => {
    let vstat = $(e.target).closest(`[board-vstat]`);
    let header = vstat.closest(`.dropdown`);
    header = header.find(`[board-visibility]`);
    let value = vstat.attr("board-vstat");

    let oldvalue = header.html();

    switch (value) {
        case '0':
            header.html(`<i class="fa fa-globe"></i> <div class="d-none d-sm-inline">Public</div>`);
            break;
        case '1':
            header.html(`<i class="fa fa-lock"></i> <div class="d-none d-sm-inline">Private</div>`);
            break;
        case '2':
            header.html(`<i class="fa fa-building"></i> <div class="d-none d-sm-inline">Espace de travail</div>`);
            break;
        default: return;
    }

    //Goto Back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("boardId", BoardId);
    formData.append("visibility", value);

    $.ajax({
        type: "POST",
        url: Origin + "Board/UpdateVisibility",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            console.log(Datas)
            if (Datas.type == "login") {
                User = null;
                window.location = Origin;
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                header.html(oldvalue);
            }

            Toast.fire({
                icon: 'success',
                title: `Changement de Visibilité`
            });
        },

        Error: function (e) {
            Toast.fire({
                icon: 'error',
                title: "erreur : " + e
            });
        }
    });

});
$(document).on('click', '[board-title]', (e) => {
    let header = $(e.target).closest(`.row`);
    let Iinput = header.find("[board-Ititle]");
    let Ititle = header.find("[board-title]");

    let title = Ititle.text();
    Iinput.attr("placeholder", title);

    Ititle.hide();
    Iinput.show();


    Iinput.focus();
});
$(document).on('focusout', '[board-Ititle]', (e) => {
    let header = $(e.target).closest(`.row`);
    let Iinput = header.find("[board-Ititle]");
    let Ititle = header.find("[board-title]");
    Ititle.show();
    Iinput.hide();
});
$(document).on('keyup', '[board-Ititle]', (e) => {
    let header = $(e.target).closest(`.row`);
    let Iinput = header.find("[board-Ititle]");
    let Ititle = header.find("[board-title]");

    let input = Iinput.val().trim();
    let title = Ititle.text();


    if (e.keyCode == 13) {

        Iinput.val("");
        if (input != "") {

            //Goto Back
            let formData = new FormData();

            formData.append("me.Mail", User.Username);
            formData.append("me.Password", User.Password);
            formData.append("boardId", BoardId);
            formData.append("boardName", input);

            $.ajax({
                type: "POST",
                url: "../Board/UpdateName",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                async: true,

                success: function (result) {
                    States = JSON.parse(result);
                    if (States.type == "login") {
                        window.location = "../";
                        return;
                    }
                    if (States.type == "error") {
                        Toast.fire({
                            icon: 'error',
                            title: States.msg
                        });
                        return;
                    }

                    Toast.fire({
                        icon: 'success',
                        title: `Mise à jour du nom du tableau :"${title}" en "${input}" Réussi`
                    });

                    Ititle.text(input);

                    //connection.invoke("UpdateState", id, newname, oldname);
                },

                Error: function (x, e) {
                    Toast.fire({
                        icon: 'error',
                        title: e
                    });
                }
            });

        }

        Ititle.show();
        Iinput.hide();

    } else if (e.keyCode == 27) {
        Iinput.val("");

        Ititle.show();
        Iinput.hide();
    }
});
//#endregion board