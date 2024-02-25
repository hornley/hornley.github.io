**********************
Personal HTML For Fun Thingz by hornley
**********************

**********************
New Thingz/Changes
**********************
- Start Menu
- Controls
> Start will now show difficulty options and its scaling..
> Add Round number top left along score.
- SFXs
> Shoot Sound
> Level up sound
- Upgrades
> Added Hotkeys (1-5 respectively)
> Added stat view
> Movement Speed upgrade: +1 to +0.2
> Attack Speed upgrade: x1.15 to +0.2
> Bullet Damage upgrade: x1.15 to +0.5
> Max Health upgrade: x1.15 to +5
- Difficulty (New formula) https://www.desmos.com/calculator/guq5ozvnaw
> Enemy Speed: 0.5 + 1 * [(round/5) + 1] * log10 (round) * Difficulty-Ratio
> Enemy Health: 1 + 3 * [(round/5) + 1] * log10 (round) * Difficulty-Ratio
> Enemy Collision Damage: 5 + 1.5 * [(round/5) + 1] * log10 (round) * Difficulty-Ratio
> Spawn Rate: 500 - log10(round) / 0.005
- Heals to full health every new round
- Spacebar will both pause and show player stats, if player has

**********************
Hotfixes
**********************
- Bullet Penetration not penetrating if enemy has lots of hp, it just gets converted to Bullet Damage.
- Experience and Score is added even if the enemy is not yet killed/eliminated.

socials
--------
`Discord Profile <https://discord.com/users/341604307113738243>`_

`Discord Server <https://discord.gg/6QmeEDjWUm>`_
