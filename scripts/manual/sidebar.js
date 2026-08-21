/*
 * Generates the User Manual page's sidebar TREE DATA and hands it to
 * <nexvane-sidebar> (scripts/components/sidebar.js). This file only
 * knows about the tree's structure — search discovery for this page is
 * a separate concern, see scripts/manual/search.js.
 *
 * Every node and leaf gets its own URL under manual/, auto-derived from
 * its full path in the hierarchy (so uniqueness comes for free — two
 * items only clash if they have the exact same title AND the exact same
 * parent). None of these pages exist yet; this is scaffolding for the
 * site's information architecture ahead of the actual content.
 *
 * Every unique English title used below has a translation in
 * scripts/manual/sidebar.lang.json (registered as a lang source below),
 * keyed as sidebar-<slug of the title> — see scripts/components/sidebar.js
 * for how that key gets attached to each rendered item.
 */
(function () {
	(window.LANG_SOURCES = window.LANG_SOURCES || [])
		.push(`${window.SITE_BASE || ''}scripts/manual/sidebar.lang.json`);

	// item(title) -> a leaf. item(title, [children]) -> a node.
	function item(title, children) {
		return children && children.length ? { title, children } : { title };
	}

	function slugify(title) {
		return title
			.toLowerCase()
			.replace(/&/g, 'and')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	// Walks the tree, turning each entry's title (plus its ancestors'
	// titles) into a URL, so every node AND leaf ends up with its own
	// distinct href without anyone having to type one by hand.
	function withUrls(entries, basePath) {
		return entries.map((entry) => {
			const path = `${basePath}/${slugify(entry.title)}`;
			const result = Object.assign({}, entry, { href: `${path}.html` });
			if (entry.children) {
				result.children = withUrls(entry.children, path);
			}
			return result;
		});
	}

	const tree = [
		item('Getting Started', [
			item('Installation'),
			item('Quick Start'),
			item('System Requirements'),
		]),
		item('Ecosystem', [
			item('Hub'),
			item('SDK', [
				item('Components', [
					item('Editor'),
					item('Engine'),
					item('Nexova'),
				]),
				item('Distributions', [
					item('Compilers'),
					item('Architectures'),
					item('Platforms'),
					item('Configurations'),
				]),
			]),
		]),
		item('Hub', [
			item('SDK Installer'),
			item('Project Manager', [
				item('Project Manipulation'),
				item('Default Compiler'),
				item('Default Compiler Architecture'),
			]),
		]),
		item('Editor', [
			item('Menus', [
				item('File'),
				item('Edit'),
				item('View'),
				item('Build'),
				item('Plugins'),
				item('Help'),
			]),
			item('Views', [
				item('Prefab'),
				item('Scene'),
			]),
			item('Windows', [
				item('Entity Inspector'),
				item('Project Explorer'),
				item('Scene Viewport'),
			]),
		]),
		item('Entities', [
			item('Instantiation'),
			item('Destruction'),
			item('Parenting & Transforms'),
		]),
		item('Components', [
			item('Callbacks', [
				item('Initialization', [
					item('Awake'),
					item('Enable'),
					item('Start'),
				]),
				item('Editor', [
					item('Reset'),
				]),
				item('Physics', [
					item('Fixed Update'),
					item('Trigger', [
						item('Enter'),
						item('Stay'),
						item('Exit'),
					]),
					item('Collision', [
						item('Enter'),
						item('Stay'),
						item('Exit'),
					]),
					item('Input', [
						item('Mouse', [
							item('Enter'),
							item('Over'),
							item('Exit'),
							item('Down'),
							item('Drag'),
							item('Up'),
							item('UpAsButton'),
						]),
					]),
				]),
				item('Game Logic', [
					item('Update'),
					item('LateUpdate'),
				]),
				item('Scene Rendering', [
					item('Pre Cull'),
					item('Became Visible'),
					item('Pre Render'),
					item('On Render'),
					item('Post Render'),
				]),
				item('Gizmo Rendering', [
					item('Render Gizmos'),
				]),
				item('GUI Rendering', [
					item('Render GUI'),
				]),
				item('Pausing', [
					item('Application Pause'),
				]),
				item('Decomissioning', [
					item('Application Quit'),
					item('Disable'),
					item('Destroy'),
				]),
			]),
		]),
		item('ECS Systems', [
			item('Queries and Views'),
		]),
		item('Game Loop', [
			item('Pipeline Overview'),
			item('Execution Order'),
			item('Interleaving Callbacks and Systems'),
		]),
		item('Scenes', [
			item('Hierarchy'),
			item('Focused Scene'),
			item('Multiple Scenes'),
		]),
		item('Resources', [
			item('Assets', [
				item('Importing Assets'),
				item('Static Asset Tree'),
				item('Asset Compilation'),
			]),
			item('Manager', [
				item('Resource Lifetime'),
				item('Warming Up Resources'),
				item('External Resource Loading'),
				item('Asynchronous Loading'),
			]),
		]),
		item('Scripting', [
			item('Native', [
				item('Introduction', [
					item('Engine API'),
					item('Handle Types'),
					item('Compilation'),
				]),
				item('Development', [
					item('Components'),
					item('Attributes'),
					item('Coroutines'),
				]),
			]),
			item('Neptune', [
				item('Design', [
					item('C++ Interoperability'),
					item('Engine Features'),
					item('Immutability By Default'),
					item('Memory Management'),
					item('Type System'),
					item('Transpilation'),
				]),
				item('Containment', [
					item('Modules'),
					item('Namespaces'),
					item('Scopes'),
				]),
				item('Types', [
					item('Classes'),
					item('Components'),
					item('Interfaces'),
					item('Delegates'),
					item('Enum'),
					item('Unions'),
					item('Flags'),
					item('Attributes'),
					item('Aliases'),
				]),
				item('Data', [
					item('Constructs', [
						item('Global Variables'),
						item('Local Variables'),
						item('Fields'),
						item('Properties'),
						item('Constants'),
						item('Parameters'),
					]),
					item('Management', [
						item('Raw Pointers'),
						item('Managed Pointers'),
						item('References'),
						item('Equality'),
						item('Copy Semantics'),
						item('Move Semantics'),
					]),
				]),
				item('Functionality', [
					item('Global Functions'),
					item('Methods'),
					item('Local Functions'),
					item('Lambdas'),
					item('Operators'),
					item('Coroutines'),
				]),
			]),
			item('Vis', [
				item('Design', [
					item('C++ Interoperability'),
					item('Engine Features'),
					item('Immutability By Default'),
					item('Memory Management'),
					item('Type System'),
					item('Transpilation'),
					item('Blocks'),
				]),
				item('Blocks', [
					item('Statements'),
					item('Expressions'),
					item('Statement Expressions'),
					item('Hat Blocks'),
					item('Children'),
					item('Inputs'),
					item('Sapling Blocks'),
				]),
				item('Containment', [
					item('Namespaces'),
					item('Scopes'),
				]),
				item('Types', [
					item('Classes'),
					item('Components'),
					item('Interfaces'),
					item('Delegates'),
					item('Enum'),
					item('Unions'),
					item('Flags'),
					item('Attributes'),
					item('Aliases'),
				]),
				item('Data', [
					item('Constructs', [
						item('Global Variables'),
						item('Local Variables'),
						item('Fields'),
						item('Properties'),
						item('Constants'),
						item('Parameters'),
					]),
					item('Management', [
						item('Raw Pointers'),
						item('Managed Pointers'),
						item('References'),
						item('Equality'),
						item('Copy Semantics'),
						item('Move Semantics'),
					]),
				]),
				item('Functionality', [
					item('Global Functions'),
					item('Methods'),
					item('Local Functions'),
					item('Lambdas'),
					item('Operators'),
					item('Coroutines'),
				]),
				item('Palette', [
					item('Motion'),
					item('Looks'),
					item('Sounds'),
					item('Events'),
					item('Control'),
					item('Operators'),
					item('Sensing'),
					item('Variables'),
					item('Procedures'),
				]),
			]),
		]),
		item('Geometry', [
			item('3D', [
				item('Meshes'),
				item('Models'),
				item('Skeleton'),
			]),
			item('2D', [
				item('Polygon'),
			]),
		]),
		item('Animations', [
			item('3D', [
				item('Skeletal Animation'),
			]),
			item('2D', [
				item('Sprite Sheets'),
				item('Sprite Swaps'),
			]),
			item('Common', [
				item('Transform Animation'),
			]),
		]),
		item('Rendering', [
			item('Materials'),
			item('Textures'),
			item('Sprites'),
			item('Fonts'),
			item('Shaders'),
			item('Videos'),
			item('Cameras', [
				item('Camera 3D'),
				item('Camera 2D'),
				item('Processing', [
					item('Shaders'),
					item('Scaling'),
				]),
				item('Occlusion Culling', [
					item('Viewport'),
					item('Render Textures'),
				]),
			]),
			item('Lighting', [
				item('Light Source'),
				item('Shadows'),
			]),
			item('Batching'),
			item('Backends', [
				item('R3D'),
			]),
		]),
		item('Audio', [
			item('Clips'),
			item('Groups'),
			item('Mixer'),
			item('Events'),
			item('Backends', [
				item('R3D'),
			]),
		]),
		item('Input', [
			item('Input'),
			item('Keys'),
			item('Buttons'),
			item('Backends', [
				item('R3D'),
			]),
		]),
		item('UI', [
			item('Style'),
			item('Components'),
			item('Backends', [
				item('RlImGui'),
			]),
		]),
		item('Physics', [
			item('Collisions', [
				item('Colliders', [
					item('Shapes', [
						item('3D', [
							item('Primitives'),
							item('Mesh'),
						]),
						item('2D', [
							item('Primitives'),
							item('Polygon'),
							item('Chain'),
						]),
					]),
				]),
				item('Callbacks', [
					item('Fixed Update'),
					item('Trigger', [
						item('Enter'),
						item('Stay'),
						item('Exit'),
					]),
					item('Collision', [
						item('Enter'),
						item('Stay'),
						item('Exit'),
					]),
				]),
				item('Detection', [
					item('Layers'),
					item('Modes', [
						item('Discrete'),
						item('Continuous'),
					]),
				]),
			]),
			item('Triggers', [
				item('Callbacks', [
					item('Enter'),
					item('Stay'),
					item('Exit'),
				]),
			]),
			item('Rigid Bodies', [
				item('Collision', [
					item('Enter'),
					item('Stay'),
					item('Exit'),
				]),
			]),
			item('Joints'),
			item('Articulations'),
			item('Ragdolls'),
			item('Characters'),
			item('Raycast', [
				item('Raycast'),
				item('RaycastHit'),
			]),
			item('Materials'),
			item('Backends', [
				item('Jolt'),
				item('Box2D'),
			]),
		]),
		item('Navigation', [
			item('Meshes'),
			item('Agents'),
			item('Surfaces'),
			item('Obstacles'),
			item('Backends', [
				item('Detour'),
			]),
		]),
		item('Networking', [
			item('Design', [
				item('Authoritative Server'),
				item('Ownership Model'),
			]),
			item('Connection', [
				item('Client'),
				item('Server'),
			]),
			item('Packets', [
				item('Reliability'),
			]),
			item('Components', [
				item('Identity'),
				item('Ownership'),
			]),
			item('Entities', [
				item('Identity'),
				item('Instantiating'),
				item('Destruction'),
			]),
			item('Remote Procedure Calls', [
				item('Targets'),
				item('Invocation Access'),
			]),
			item('Replication', [
				item('Dirty Tracking'),
				item('Shadow Buffer'),
				item('Delta Compressing'),
				item('Bit Serializers'),
				item('Fragmentation'),
				item('Delivering'),
				item('Receiving'),
				item('Patching'),
			]),
			item('Development', [
				item('Component Design'),
				item('Multiple Scenes'),
				item('Delegating Ownership'),
				item('Minimizing Replicated Entities'),
			]),
			item('Backends', [
				item('Enet'),
			]),
		]),
	];

	// Only the very first section starts open — with 300+ items, expanding
	// everything by default would make the sidebar unusable.
	tree[0].expanded = true;

	const sidebar = document.querySelector('nexvane-sidebar');
	if (sidebar) {
		sidebar.tree = withUrls(tree, `${window.SITE_BASE || ''}manual`);
	}
})();
