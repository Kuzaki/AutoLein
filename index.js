module.exports = function AutoLein(dispatch) {
	
	let cid = null,
		player = '',
		cooldown = false,
		enabled,
		battleground,
		onmount,
		incontract,
		inbattleground,
		alive,
		inCombat
		wasEnraged = 0
		bosses = new Set()


	 
	dispatch.hook('S_LOGIN', 1, event => {
		({cid} = event)
		player = event.name
		enabled = true
	})
			
	dispatch.hook('S_BOSS_GAGE_INFO', 1, (event) => {
        bosses.add("" + event.id)
	 })
	
	dispatch.hook('S_LOAD_TOPO', 1, event => {
		if(event.zone == 9950) inHH = true
		else inHH = false
	})
	
	dispatch.hook('S_START_COOLTIME_ITEM', 1, event => { 
		let item = event.item
		let thiscooldown = event.cooldown
		
		if(item == 80081) { // has 60 seconds cooldown
			cooldown = true
			setTimeout(() => {
				cooldown = false
			}, thiscooldown*1000)
		}
	})
	
	dispatch.hook('S_NPC_STATUS', 1, event => {
	
		if((!enabled) || (inHH)) return
        if(!(bosses.has("" + event.creature))) return
		
			if((event.enraged == 0) && (wasEnraged == 1)) {
            wasEnraged = 0
			}		
		if((!cooldown) && (event.enraged == 1) && (wasEnraged == 0)) {
			wasEnraged = 1
			useItem()
		}
	})
	
	
	 dispatch.hook('S_DESPAWN_NPC', 1, (event) => {
		if(bosses.delete("" + event.target)) wasEnraged = 0
    })
	
	function useItem() {
		if (!enabled) return
		if(alive && inCombat && !onmount && !incontract && !inbattleground) {
			dispatch.toServer('C_USE_ITEM', 1, {
				ownerId: cid,
				item: 80081, // 80081: Lein's Dark Root Beer
				id: 0,
				unk1: 0,
				unk2: 0,
				unk3: 0,
				unk4: 1,
				unk5: 0,
				unk6: 0,
				unk7: 0,
				x: 0, 
				y: 0, 
				z: 0, 
				w: 0, 
				unk8: 0,
				unk9: 0,
				unk10: 0,
				unk11: 1,
			})
		}
	}
	
	//Checks
	
	dispatch.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, event => { battleground = event.zone })
	dispatch.hook('S_LOAD_TOPO', 1, event => {
		onmount = false
		incontract = false
		inbattleground = event.zone == battleground
	})
	
	dispatch.hook('S_SPAWN_ME', 1, event => { 
		alive = event.alive
	})
	
	dispatch.hook('S_USER_STATUS', 1, event => { 
		if(event.target.equals(cid)) {
			if(event.status == 1) {
				inCombat = true
			}
			else inCombat = false
		}
	})
	
	dispatch.hook('S_CREATURE_LIFE', 1, event => {
		if(event.target.equals(cid) && (alive != event.alive)) {
			if(!alive) {
				onmount = false
				incontract = false
			}
		}
	})

	dispatch.hook('S_MOUNT_VEHICLE', 1, event => { if(event.target.equals(cid)) onmount = true })
	dispatch.hook('S_UNMOUNT_VEHICLE', 1, event => { if(event.target.equals(cid)) onmount = false })

	dispatch.hook('S_REQUEST_CONTRACT', 1, event => { incontract = true })
	dispatch.hook('S_ACCEPT_CONTRACT', 1, event => { incontract = false })
	dispatch.hook('S_REJECT_CONTRACT', 1, event => { incontract = false })
	dispatch.hook('S_CANCEL_CONTRACT', 1, event => { incontract = false })

	//Commands
	dispatch.hook('C_WHISPER', 1, (event) => {
		if(event.target.toUpperCase() === "!autolein".toUpperCase()) {
			if (/^<FONT>on?<\/FONT>$/i.test(event.message)) {
				enabled = true
				message('autolein <font color="#56B4E9">enabled</font>.')
			}
			else if (/^<FONT>off?<\/FONT>$/i.test(event.message)) {
				enabled = false
				message('autolein <font color="#56B4E9">disabled</font>.')
			}
			else message('Commands:<br>'
								+ ' "on" (enable autolein),<br>'
								+ ' "off" (disable autolein)'
						)
			return false
		}
	})
	
	function message(msg) {
		dispatch.toClient('S_WHISPER', 1, {
			player: cid,
			unk1: 0,
			gm: 0,
			unk2: 0,
			author: '!autolein',
			recipient: player,
			message: msg
		})
	}
	
	dispatch.hook('C_CHAT', 1, event => {
		if(/^<FONT>!rootbeer<\/FONT>$/i.test(event.message)) {
			if(!enabled) {
				enabled = true
				message('autolein <font color="#56B4E9">enabled</font>.')
			
			}
			else {
				enabled = false
				message('autolein <font color="#56B4E9">disabled</font>.')
				
			}
			return false
		}
	})
}