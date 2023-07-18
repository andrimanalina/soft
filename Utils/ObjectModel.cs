namespace SoftTrello.Utils
{
    public static class ObjectModel
    {
        public static string CreateState(string id, string name, int position)
        {
            return $@"
                <div class=""card card-row card-default sort Trello-State"" state-id=""{id}"" state-position=""{position}"">
                    <div class=""card-header bg-info"">
                        <h3 class=""card-title"">
                            {name}
                        </h3>
                    </div>
                    <div class=""card-body"" card-list>
                        <div class=""card card-transparent"" card-new>
                            <div class=""card-header"" card-plus>
                                <h3 class=""card-title"">
                                    <i class=""fa fa-plus""></i> Ajouter une tâche
                                </h3>
                            </div>
                            <div card-title style=""display:none"">
                                <div class=""card-header inputAddList"">
                                    <input type=""text"" class=""card-title form-control"" placeholder=""Saisissez le nom de la tâche..."" />
                                </div>
                                <div class=""card-body d-flex"">
                                    <div class=""btn btn-primary col-6 ml-1"" card-add>Ajouter</div>
                                    <i class=""fa fa-times col-2 cancelList"" card-cancel></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ";
        }

        public static string CreateWorkspace(string id, string name, string color)
        {
            return $@"
                <div class=""col-lg-3 col-6"" data-type=""workspace"" onclick=""GetWorkspace('{id}')"" style=""cursor:pointer"">
                    <div class=""small-box small-box2"" style=""background:{color}"">
                        <div class=""inner"">
                            <h5 class=""w-name text-bold text-white"">{name}</h5>
                        </div>
                    </div>
                </div>
            ";
        }
    }
}
