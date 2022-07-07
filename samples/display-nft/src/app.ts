/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import Web3 from 'web3';
import {NftCollectionContractService} from "../services/nft-collection-contract-service";

let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

/**
 * The main class of this app. All the logic goes here.
 */
export default class HelloWorld {

	private imageURL: string = 
	"https://upload.wikimedia.org/wikipedia/commons/0/05/Alexander_Hamilton_portrait_by_John_Trumbull_1806.jpg";

	private text: MRE.Actor = null;
	private cube: MRE.Actor = null;
	private assets: MRE.AssetContainer;

	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);
		const image = this.assets.createTexture("image", {uri: this.imageURL});

		const imageTexture = this.assets.createTexture("picture",{
			uri: this.imageURL
		});
	
		const imageMaterial = this.assets.createMaterial("pictureMat", {
			alphaMode: MRE.AlphaMode.Mask,
			mainTextureId: imageTexture.id,
			emissiveTextureId: imageTexture.id,
			emissiveColor: new MRE.Color4(1, 1, 1, 1)
		});

		const display = MRE.Actor.Create(this.context, {
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
					contents: this.imageURL,
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
			{ displayImage: display },
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

		function getImageURL(tokenId: string|number): string {
			const tokenURI = (await contract.methods.tokenURI(tokenId).call()).replace("ipfs://", "https://ipfs.io/ipfs/");
			const { image } = (await fetch(tokenURI).then(res => res.json)) as any;
			return image as string;
		  }
}