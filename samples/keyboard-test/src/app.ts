/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as MRE from "@microsoft/mixed-reality-extension-sdk";
/**
 * The main class of this app. All the logic goes here.
 */

export default class Elevator {
	private assets: MRE.AssetContainer;
	// private paper: MRE.Actor = null;
	private text: MRE.Actor[];
	private box: MRE.Actor[];
	private config: { [key: string]: number };
	private strings: string[];
	private state = true;


	constructor(private context: MRE.Context, private params: MRE.ParameterSet) {
		this.context.onStarted(() => this.started());
	}

	private user: MRE.User;
	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);
		const allowed = ["boards", "spread"]
		this.config = { "boards": 4, "spread": 2 };
		for (const key in this.params) {

			this.config[key] = Number(this.params[key]);
			
		}

		this.strings = new Array(this.config["boards"]);
		this.text = new Array(this.config["boards"]);
		this.box = new Array(this.config["boards"]);

		const baseCube = this.assets.createBoxMesh("cube", 0.4, 0.4, 0.4);
		const blackMaterial = this.assets.createMaterial("blackmat", {
			color: MRE.Color3.Red()
		});

		let reset = MRE.Actor.Create(this.context, {
			actor: {
				name: 'reset',
				transform: {
					local: {
						position: { x: 0, y: 0, z: 0 },
						scale: { x: 0.3, y: 0.3, z: 0.3 }
					}
				},
				appearance: {
					meshId: baseCube.id,
					materialId: blackMaterial.id
				},
				collider: { geometry: { shape: MRE.ColliderType.Auto } }
			}
		});
		const buttonB = reset.setBehavior(MRE.ButtonBehavior);
		buttonB.onClick(_ => {
			this.update_all(-1);
		});

		const papermodel = await this.assets.loadGltf('Paper.glb', "box");
		let posX = 1;
		for (let i = 0; i < this.config["boards"]; i++) {
			const paper = MRE.Actor.CreateFromLibrary(this.context, {
				// using the data we loaded earlier
				resourceId:"artifact:1956000528831873200",
				// Also apply the following generic actor properties.
				actor: {
					name: 'down button',
					transform: {
						local: {
							position: { x: posX, y: 0, z: 0 },
							scale: { x: 0.4, y: 0.4, z: 0.4 }
						}
					}
				}
			});
			const paperBehavior = paper.setBehavior(MRE.ButtonBehavior);
			paperBehavior.onClick(_ => {
				_.prompt("Fill in the blank", true)
					.then(res => {
						// console.log(res);

						if (res.submitted) {
							this.strings[i] = res.text;
							// console.log(this.strings);
							this.update_all(i);
							this.create_Text();
						}
					})
					.catch(err => {
						console.error(err);
					});
			});
			posX += this.config["spread"];

		}

	}
	private create_Text() {

		let posX = 1;
		for (let i = 0; i < this.config["boards"]; i++) {
			if (this.strings[i] !== undefined) {
				if (this.text[i] === undefined) {
					this.text[i] = MRE.Actor.Create(this.context, {
						actor: {
							name: 'Text',
							transform: {
								local: {
									position: { x: posX, y: (i%2===0) ? 1.5 : 1.75, z: 0 },
									scale: { x: 0.8, y: 0.8, z: 0.8 }
								}
							},
							text: {
								contents: this.strings[i],
								anchor: MRE.TextAnchorLocation.MiddleCenter,
								color: { r: 0 / 255, g: 0 / 255, b: 0 / 255 },
								height: 0.3
							}
						}
					});
				}
				const baseCube = this.assets.createBoxMesh("cube", 0.4, 0.4, 0.4);
				const blackMaterial = this.assets.createMaterial("blackmat", {
					color: MRE.Color3.Black()
				});
				if (this.box[i] === undefined) {
					this.box[i] = MRE.Actor.Create(this.context, {
						actor: {
							name: 'Text',
							transform: {
								local: {
									position: { x: posX, y: (i%2===0) ? 1.5 : 1.75, z: 0 },
									scale: { x: this.strings[i].length * 0.4, y: 0.8, z: 0.1 }
								}
							},
							appearance: {
								meshId: baseCube.id,
								materialId: blackMaterial.id
							},
							collider: { geometry: { shape: MRE.ColliderType.Auto } }
						}
					});
					const buttonB = this.box[i].setBehavior(MRE.ButtonBehavior);
					buttonB.onClick(_ => {
						this.box[i].appearance.enabled = false;
					});
				}
				
			}
			posX += this.config["spread"];
		}
	}
	private update_all(obj = -1) {
		if (obj === -1) {
			for (let i = 0; i < this.config["boards"]; i++) {
				if (this.text[i] !== undefined) {
					this.text[i].destroy();
					this.text[i]= undefined;
				}
				if (this.box[i] !== undefined) {
					this.box[i].destroy();
					this.box[i]= undefined;
				}
				this.strings[i]= undefined;
			}
		}
		else {
			if (this.text[obj] !== undefined) {
				this.text[obj].destroy();
				this.text[obj]= undefined;
			}
			if (this.box[obj] !== undefined) {
				this.box[obj].destroy();
				this.box[obj]= undefined;
			}
			// console.log(this.text);
			// console.log(this.box);
			
		}
	}
}
