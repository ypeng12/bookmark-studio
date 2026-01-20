
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'core/constants/app_constants.dart';

void main() {
  runApp(const GeminiLensApp());
}

class GeminiLensApp extends StatelessWidget {
  const GeminiLensApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GeminiLens AI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Inter',
      ),
      home: const MainLayout(),
    );
  }
}

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Sidebar
          NavigationRail(
            extended: MediaQuery.of(context).size.width > 900,
            selectedIndex: _selectedIndex,
            onDestinationSelected: (int index) => setState(() => _selectedIndex = index),
            leading: const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: CircleAvatar(
                backgroundColor: Colors.blue,
                child: Icon(LucideIcons.brainCircuit, color: Colors.white),
              ),
            ),
            destinations: const [
              NavigationRailDestination(icon: Icon(LucideIcons.image), label: Text('All Photos')),
              NavigationRailDestination(icon: Icon(LucideIcons.bookmark), label: Text('Bookmarks')),
              NavigationRailDestination(icon: Icon(LucideIcons.barChart3), label: Text('Analytics')),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          // Content
          Expanded(
            child: CustomScrollView(
              slivers: [
                _buildHeader(),
                _buildFileGrid(),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        icon: const Icon(LucideIcons.camera),
        label: const Text('New Photo'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildHeader() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Row(
          children: [
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Memory Lens', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                  Text('Browse and search your photos with AI', style: TextStyle(color: Colors.grey)),
                ],
              ),
            ),
            SizedBox(
              width: 320,
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Find "sunset at the beach"...',
                  prefixIcon: const Icon(LucideIcons.search),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFileGrid() {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
          maxCrossAxisExtent: 220,
          mainAxisSpacing: 20,
          crossAxisSpacing: 20,
          childAspectRatio: 0.75,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) => _PhotoCard(index: index),
          childCount: 12,
        ),
      ),
    );
  }
}

class _PhotoCard extends StatefulWidget {
  final int index;
  const _PhotoCard({required this.index});

  @override
  State<_PhotoCard> createState() => _PhotoCardState();
}

class _PhotoCardState extends State<_PhotoCard> {
  bool isBookmarked = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[200]!),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  width: double.infinity,
                  color: Colors.grey[100],
                  child: const Icon(LucideIcons.image, color: Colors.grey, size: 40),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Photo Analysis', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text('Sunset, nature, red sky', style: TextStyle(color: Colors.grey[500], fontSize: 11)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, py: 2),
                          decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(4)),
                          child: const Text('Similarity: 98%', style: TextStyle(color: Colors.blue, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    )
                  ],
                ),
              ),
            ],
          ),
          Positioned(
            top: 8,
            right: 8,
            child: IconButton(
              onPressed: () => setState(() => isBookmarked = !isBookmarked),
              icon: Icon(
                isBookmarked ? LucideIcons.heart : LucideIcons.heart,
                color: isBookmarked ? Colors.red : Colors.white.withOpacity(0.8),
                fill: isBookmarked ? 1.0 : 0.0,
              ),
              style: IconButton.styleFrom(
                backgroundColor: isBookmarked ? Colors.white : Colors.black12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
