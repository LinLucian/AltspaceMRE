/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import Web3 from "web3";
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { AbiItem } from "web3-utils";

const web3 = new Web3('https://mainnet.infura.io/v3/6b4a6b9998e94db182a48a6ccf3dee55');
const _importDynamic = new Function('modulePath', 'return import(modulePath)');

async function fetch(...args: string[]) {
	const { default: fetch } = await _importDynamic('node-fetch');
	return fetch(...args);

}

/**
 * The main class of this app. All the logic goes here.
 */
export default class HelloWorld {
	readonly abi: AbiItem[] = [
		{
			"constant": true,
			"inputs": [
				{
					"name": "_tokenId",
					"type": "uint256"
				}
			],
			"name": "tokenURI",
			"outputs": [
				{
					"name": "",
					"type": "string"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function",
		},
	];

	private text: MRE.Actor = null;
	private display: MRE.Actor = null;
	private cube: MRE.Actor = null;
	private assets: MRE.AssetContainer;
	private response: string;
	private inputContactAddress: string;
	private inputTokenID: string;

	constructor(private context: MRE.Context, private params: MRE.ParameterSet) {
		this.context.onStarted(() => this.started());
		console.log('Params:', params);
	}

	private async getNFTDetails(contractAddress: string, tokenId: string): Promise<string> {
		const contract = new web3.eth.Contract(this.abi, String(contractAddress));
		const tokenURI = await contract.methods.tokenURI(String(tokenId)).call();
		const filterTokenURI = tokenURI.replace(/^ipfs?:\/\//, '');
		const TokenURIlink = "https://ipfs.io/ipfs/" + filterTokenURI;
		console.log(TokenURIlink);
		const response = await fetch(TokenURIlink);
		console.log(response);
		const data = await response.json();
		const filterData = data["image"].replace(/^ipfs?:\/\//, '');
		const final = "https://ipfs.io/ipfs/" + filterData;
		return final;
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

		// create button for NFT contact address input
		const inputObject1 = MRE.Actor.Create(this.context, {
			actor: {
				name: "inputObject",
				appearance: {
					meshId: this.assets.createBoxMesh('box', 0.1, 0.1, 0.1).id
				},
				transform: {
					local: {
						position: { x: -1, y: 0, z: 0 }
					}
				},
				collider: {
					layer: MRE.CollisionLayer.Hologram,
					geometry: {
						shape: MRE.ColliderType.Auto
					}
				}
			}
		});

		// set the NFT contact address input button to prompt user response
		const inputBehavior1 = inputObject1.setBehavior(MRE.ButtonBehavior);
		inputBehavior1.onClick(click => {
			click.prompt("Enter the NFT contact address:", true)
				.then(result => {
					if (result.submitted) {
						this.inputContactAddress = result.text;
						console.log(result.text);
						if (this.display !== null){
							this.display.destroy();
							this.display = null;
						}
						if (this.text !== null){
							this.text.destroy();
							this.text = null;
						}
					}
				})
				.catch(err => {
					console.error(err)
				});
			click.prompt("Enter the NFT token ID:", true)
				.then(result => {
					if (result.submitted) {
						this.inputTokenID = result.text;
						console.log(result.text);
						this.generateNFT();
					}
				})
				.catch(err => {
					console.error(err)
				});
		});

		// const inputA = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
		// const inputB = "3571";

		//call getNFTDetails function and apply the image url to imageTexture

	}
	private async generateNFT() {

		this.response = await this.getNFTDetails(this.inputContactAddress, this.inputTokenID);
		console.log('Response:', this.response);
a
		const imageTexture = this.assets.createTexture("picture", {
			uri: this.response
		});

		const imageMaterial = this.assets.createMaterial("pictureMat", {
			alphaMode: MRE.AlphaMode.Mask,
			mainTextureId: imageTexture.id,
			emissiveTextureId: imageTexture.id,
			emissiveColor: new MRE.Color4(1, 1, 1, 1)
		});

		this.display = MRE.Actor.Create(this.context, {
			actor: {
				name: "displayImage",
				appearance: {
					materialId: imageMaterial.id,
					meshId: this.assets.createBoxMesh('box', 1.5, 1.5, 0.0001).id
				},
				transform: {
					local: {
						position: { x: 0, y: 0, z: 0 }
					}
				},
				collider: {
					layer: MRE.CollisionLayer.Hologram,
					geometry: {
						shape: MRE.ColliderType.Auto
					}
				}
			}
		});

		//Text above image
		this.text = MRE.Actor.Create(this.context, {
			actor: {
				name: 'text',
				transform: {
					app: { position: { x: 0, y: 1, z: 0 } }
				},
				text: {
					contents: "Contact Address: " + this.inputContactAddress + " \n" + "Token ID: " + this.inputTokenID,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 255 / 255, g: 255 / 255, b: 255 / 255 },
					height: 0.1
				}
			}
		});

		const spinAnimData = this.assets.createAnimationData(
			// The name is a unique identifier for this data. You can use it to find the data in the asset container,
			// but it's merely descriptive in this sample.
			"Spin",
			{
				// Animation data is defined by a list of animation "tracks": a particular property you want to change,
				// and the values you want to change it to.
				tracks: [{
					// This animation targets the rotation of an actor named "text"
					target: MRE.ActorPath("displayImage").transform.local.rotation,
					// And the rotation will be set to spin over 20 seconds
					keyframes: this.generateSpinKeyframes(20, MRE.Vector3.Up()),
					// And it will move smoothly from one frame to the next
					easing: MRE.AnimationEaseCurves.Linear
				}]
			});
		// Once the animation data is created, we can create a real animation from it.
		spinAnimData.bind(
			// We assign our text actor to the actor placeholder "text"
			{ displayImage: this.display },
			// And set it to play immediately, and bounce back and forth from start to end
			{ isPlaying: true, wrapMode: MRE.AnimationWrapMode.PingPong });
	}

	/**
	 * Generate keyframe data for a simple spin animation.
	 * @param duration The length of time in seconds it takes to complete a full revolution.
	 * @param axis The axis of rotation in local space.
	 */
	private generateSpinKeyframes(duration: number, axis: MRE.Vector3): Array<MRE.Keyframe<MRE.Quaternion>> {
		return [{
			time: 0 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 0)
		}, {
			time: 0.25 * duration,
			value: MRE.Quaternion.RotationAxis(axis, Math.PI / 2)
		}, {
			time: 0.5 * duration,
			value: MRE.Quaternion.RotationAxis(axis, Math.PI)
		}, {
			time: 0.75 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 3 * Math.PI / 2)
		}, {
			time: 1 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 2 * Math.PI)
		}];
	}
}