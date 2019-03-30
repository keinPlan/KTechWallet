
import { IKtlStorage } from "./KTechLib";



export class KtlStorageGdrive implements IKtlStorage {
    mainFolderId: string | undefined = undefined;
    public GapiLoaded = false;

    constructor() {
        console.log("gapi.load");
        gapi.load("client:auth2", this.InitGapi.bind(this));
    }

    InitGapi(): void {
        console.log("gapi.load --> done");
        this.GapiLoaded = true;
    }

    async GetMainFolderId(): Promise<string> {
        let rsp = await gapi.client.drive.files.list({
            q: "mimeType = 'application/vnd.google-apps.folder' and name='KTechWallet'"
        });

        console.log(rsp);
        if (rsp.result.files) {
            if (rsp.result.files.length === 1) {
                this.mainFolderId = rsp.result.files[0].id;
            } else if (rsp.result.files.length === 0) {
                // create the main folder
                let creatfolderRsp = await gapi.client.drive.files.create({
                    name: "KTechWallet",
                    mimeType: "application/vnd.google-apps.folder"
                });

                this.mainFolderId = creatfolderRsp.result.id;
            }
        }
        if (this.mainFolderId) {
            return this.mainFolderId;
        }

        throw "KtlStorageGdrive.GetMainFolderId --> failed";
    }



    get IsConnected(): boolean {
        if (!gapi || !gapi.auth2) { return false; }
        if (gapi.auth2.getAuthInstance()) {
            return gapi.auth2.getAuthInstance().isSignedIn.get();

        }
        return false;
    }

    async  Connect(): Promise<any> {
        try {


            let p1: any = await gapi.client
                .init({
                    // clientId: "597515798192-i3urf9d5iniuji59038l3cmo971sfl9d.apps.googleusercontent.com",
                    clientId: "977249252190-hr0rvc9duan28525nlbbdd4j537i3cpv.apps.googleusercontent.com",
                    scope: "https://www.googleapis.com/auth/drive.file",
                    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
                });

            p1 = await gapi.auth2.getAuthInstance().signIn(new gapi.auth2.SigninOptionsBuilder().setPrompt("select_account"));



            return await this.GetMainFolderId();
        } catch (error) {
            console.log(error);
        }

    }

    DisConnect(): void {
        gapi.auth2.getAuthInstance().signOut();
    }


    async Load(key: string): Promise<string> {
        let p1 = gapi.client.drive.files.list({ q: "'" + this.mainFolderId + "' in parents and name='" + key + "'" })
            .then((r) => {
                console.log("loading: " + key);
                if (r.result.files && r.result.files[0] && r.result.files[0].id) {
                    return r.result.files[0].id;
                }
            }).then((id) => {
                if (id) {
                    return this.GetFileContent(id);
                }
                return "";
            });

        return p1;
    }


    Save(key: string, data: string): void {
        gapi.client.drive.files.list({ q: "'" + this.mainFolderId + "' in parents and name ='" + key + "'" })
            .then((r) => {
                if (r.result.files && r.result.files[0] && r.result.files[0].id) {
                    console.log("update: " + key);
                    this.UploadContent(r.result.files[0].id, data);
                } else {
                    gapi.client.drive.files.create({ parents: [this.mainFolderId], name: key })
                    .then((rr:any) => {
                        console.log("create: " + key);
                        this.UploadContent(rr.result.id, data);
                    });
                }
            });
    }



    UploadContent(fileId: string, content: string): void {



        var file = new Blob([content], { type: "text/plain" });
        var metadata = {
            // "fileId": fileId, // Filename at Google Drive
            "mimeType": "application/json", // mimeType at Google Drive
        };

        var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
        var form = new FormData();
        form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
        form.append("file", file);

        fetch("https://www.googleapis.com/upload/drive/v3/files/" + fileId + "?uploadType=multipart&fields=id", {
            method: "PATCH",
            headers: new Headers({ "Authorization": "Bearer " + accessToken }),
            body: form,
        }).then((res) => {
            return res.json();
        }).then(function (val) {
            console.log(val);
        });
    }

    async GetFileContent(fileId: string): Promise<string> {

        let p = fetch("https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media", {
            method: "GET",
            headers: new Headers(
                {
                    "Authorization": "Bearer " + gapi.auth.getToken().access_token,
                    "Content-Type": "plan/text"
                }),
        }).then((rsp) => {
            if (!rsp){
                throw "GetFileContent failed";
            } else if (!rsp.body){
                return "";
            }

            var reader = rsp.body.getReader();
            var decoder = new TextDecoder();
            return reader.read().then((result) => {
                var data: string = decoder.decode(result.value);
                return data;
            });

        });

        return p;
    }
}
