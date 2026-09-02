-- 009b_seed_sample_manuals_standalone.sql
-- NO PREREQUISITES: works even if auth.users or public.users demo accounts don't exist yet.
-- Picks the FIRST public.user with role='instructor' to own the seeded CSC222 manual.
-- If no instructor exists yet, creates one locally in public.users (login separately needs auth.users for JWT — but at least data is seeded).

DO $seed_manuals_009b$
DECLARE
    _instructor_id UUID;
    _manual_id UUID;
BEGIN
    -- 1. Find ANY instructor user (not just the demo one)
    SELECT id INTO _instructor_id
      FROM public.users
     WHERE role = 'instructor'
     ORDER BY created_at ASC NULLS LAST
     LIMIT 1;

    -- 2. If NO instructor user exists in public.users yet, bootstrap one with a fake UUID
    --    (Later when someone actually creates an auth login, 002_seed_users will upsert correctly.)
    IF _instructor_id IS NULL THEN
        _instructor_id := '00000000-0000-0000-0000-000000000001'::uuid;
        INSERT INTO public.users (id, email, role, full_name)
        VALUES (_instructor_id, 'instructor@demo.com', 'instructor', 'Demo Instructor')
        ON CONFLICT (id) DO NOTHING;
        RAISE NOTICE 'No instructor found in public.users; bootstrapped one (id=0000…001). Run 002_seed_users.sql after creating Auth dashboard users to link real logins.';
    END IF;

    RAISE NOTICE 'Seeding CSC222 manual for instructor id=%', _instructor_id;

    -- 3. Upsert the manual
    INSERT INTO public.manuals (
        instructor_id, course_code, title, description, semester,
        deadline, published, import_batch_id
    ) VALUES (
        _instructor_id,
        'CSC222',
        'Game Programming with Pygame — Lab Manual (2026/27)',
        'Introductory Pygame lab pack covering surfaces, drawing, events, and sprite movement.',
        '2026/27 Semester 1',
        NOW() + INTERVAL '16 weeks',
        TRUE,
        'seed-csc222-v1'
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO _manual_id;

    IF _manual_id IS NULL THEN
        SELECT id INTO _manual_id
          FROM public.manuals
         WHERE import_batch_id = 'seed-csc222-v1'
         LIMIT 1;
    END IF;

    RAISE NOTICE 'Manual id: %', _manual_id;

    -- 4. Upsert 4 sample tasks
    INSERT INTO public.tasks (
        manual_id, order_index, title, instruction_text,
        pdf_section_label, pdf_page_start, pdf_page_end,
        language, starter_code, expected_output, points
    ) VALUES
      (_manual_id, 1,
       'Task 1.1 — Initialize a Pygame window',
       'Write a script that creates a 640x480 Pygame window with a caption and a main loop that quits on close.',
       'Section 1.2', 6, 9,
       'python',
$$import pygame

pygame.init()
screen = pygame.display.set_mode((640, 480))
pygame.display.set_caption("CSC222 — Task 1.1")

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

pygame.quit()
$$,
       NULL, 10),

      (_manual_id, 2,
       'Task 2.1 — Draw a colored rectangle',
       'Using the window from Task 1.1, fill the screen black and draw a solid red rectangle at (50, 50) sized 120x80.',
       'Section 2.1', 16, 19,
       'python',
$$import pygame

pygame.init()
screen = pygame.display.set_mode((640, 480))

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    screen.fill((0, 0, 0))
    pygame.draw.rect(screen, (255, 0, 0), pygame.Rect(50, 50, 120, 80))
    pygame.display.flip()

pygame.quit()
$$,
       NULL, 15),

      (_manual_id, 3,
       'Task 3.1 — React to arrow key presses',
       'Print LEFT / RIGHT / UP / DOWN messages inside the event loop whenever the corresponding arrow key is pressed. Quit when the window is closed.',
       'Section 3.1', 22, 27,
       'python',
$$import pygame

pygame.init()
screen = pygame.display.set_mode((640, 480))

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT:
                print("LEFT")
            elif event.key == pygame.K_RIGHT:
                print("RIGHT")
            elif event.key == pygame.K_UP:
                print("UP")
            elif event.key == pygame.K_DOWN:
                print("DOWN")

pygame.quit()
$$,
       NULL, 15),

      (_manual_id, 4,
       'Task 4.1 — Move a player rectangle with arrow keys',
       'Combine the tasks above: a black screen, one blue player rect at (300,220), 40x40, arrow keys move it 3 pixels per frame. Clamp it inside 640x480.',
       'Section 4.1', 32, 37,
       'python',
$$import pygame

pygame.init()
screen = pygame.display.set_mode((640, 480))
clock = pygame.time.Clock()

player = pygame.Rect(300, 220, 40, 40)
speed = 3

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]  and player.left > 0:
        player.move_ip(-speed, 0)
    if keys[pygame.K_RIGHT] and player.right < 640:
        player.move_ip(speed, 0)
    if keys[pygame.K_UP]    and player.top > 0:
        player.move_ip(0, -speed)
    if keys[pygame.K_DOWN]  and player.bottom < 480:
        player.move_ip(0, speed)

    screen.fill((0, 0, 0))
    pygame.draw.rect(screen, (0, 90, 255), player)
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
$$,
       NULL, 20)
    ON CONFLICT (manual_id, order_index) DO NOTHING;

    RAISE NOTICE 'Seeded 4 tasks for CSC222 manual id=%', _manual_id;
END $seed_manuals_009b$;
